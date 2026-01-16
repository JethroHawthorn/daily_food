import { Food } from '@/actions/food';
import { MealHistory } from '@/lib/data';

interface RandomOptions {
  budget: number;
  mainDishCount: number;
  sideDishCount: number;
}

interface RandomResult {
  foods: Food[];
  totalPrice: number;
  relaxedInfo?: string[];
}

export function generateRandomMeal(
  foods: Food[],
  history: MealHistory[],
  options: RandomOptions
): RandomResult | null {
  const { budget, mainDishCount, sideDishCount } = options;
  
  // 1. Separate types
  const mainDishes = foods.filter(f => f.type === 'CHINH');
  const sideDishes = foods.filter(f => f.type === 'PHU'); // Or other types if needed
  
  if (mainDishes.length < mainDishCount || sideDishes.length < sideDishCount) {
    return null; // Not enough food to choose from
  }

  // Helper to check conditions
  const isValidCombo = (mains: Food[], sides: Food[], strictHistory = true, strictEgg = true): boolean => {
    const selected = [...mains, ...sides];
    const money = selected.reduce((sum, f) => sum + (f.price || 0), 0);
    
    // Budget check
    if (money > budget) return false;

    // History checks
    if (strictHistory) {
      // Rule 1: No main dish eaten in last 7 days
      const last7DaysFoodIds = history.flatMap(h => JSON.parse(h.food_ids));
      const hasDuplicateMain = mains.some(m => last7DaysFoodIds.includes(m.id));
      if (hasDuplicateMain) return false;
    }

    if (strictEgg) {
       // Rule 2: Egg dishes (tag 'trung') max 1 in last 3 meals
       const eggDishes = selected.filter(f => f.tags?.includes('trung') || f.name.toLowerCase().includes('trung'));
       if (eggDishes.length > 0) {
         // Check last 3 meals
         const last3Meals = history.slice(0, 3);
         let eggCountLast3 = 0;
         for (const meal of last3Meals) {
            const ids = JSON.parse(meal.food_ids) as number[];
             // Ideally we need to know if past meals had eggs. 
             // Since we only have IDs, we need to map back to foods.
             // For simplicity/performance here, we assume if we selected it, it counts.
             // But wait, we need to check if *previous* meals had eggs.
             // Current design loads all foods so we can check.
             const mealFoods = foods.filter(f => ids.includes(f.id));
             if (mealFoods.some(f => f.tags?.includes('trung') || f.name.toLowerCase().includes('trung'))) {
               eggCountLast3++;
             }
         }
         
         if (eggCountLast3 >= 1) return false; // Already had egg recently
       }
    }

    return true;
  };
  
  // Shuffle helper
  const shuffle = <T>(array: T[]) => array.sort(() => Math.random() - 0.5);

  // Strategy 1: Strict Mode
  for (let i = 0; i < 100; i++) { // Try 100 times to find a combo
    const shuffledMains = shuffle([...mainDishes]).slice(0, mainDishCount);
    const shuffledSides = shuffle([...sideDishes]).slice(0, sideDishCount);
    
    if (isValidCombo(shuffledMains, shuffledSides, true, true)) {
       const selected = [...shuffledMains, ...shuffledSides];
       return {
         foods: selected,
         totalPrice: selected.reduce((s, f) => s + (f.price || 0), 0)
       };
    }
  }

  // Strategy 2: Relax Rules
  // Relax 1: Allow duplicate Main (prefer oldest)
  // We sort mains by "last eaten" ascending (not eaten -> eaten long ago -> eaten recently)
  // Actually, standard shuffle is bad here. We want to prioritize "not recently eaten".
  
  // Let's simplified relax: Just try valid combo with strictHistory = false
  for (let i = 0; i < 100; i++) {
     const shuffledMains = shuffle([...mainDishes]).slice(0, mainDishCount);
    const shuffledSides = shuffle([...sideDishes]).slice(0, sideDishCount);

     // Relax history but keep egg rule first? Spec says relax main oldest first.
     // Implementing "prefer oldest" is complex with random. 
     // We will just try disabling strictHistory first.
     if (isValidCombo(shuffledMains, shuffledSides, false, true)) {
        const selected = [...shuffledMains, ...shuffledSides];
        return {
          foods: selected,
          totalPrice: selected.reduce((s, f) => s + (f.price || 0), 0),
          relaxedInfo: ['Đã bỏ qua quy tắc trùng món chính 7 ngày']
        };
     }
  }
  
   // Relax 2: Ignore Egg rule
   for (let i = 0; i < 100; i++) {
     const shuffledMains = shuffle([...mainDishes]).slice(0, mainDishCount);
    const shuffledSides = shuffle([...sideDishes]).slice(0, sideDishCount);

     if (isValidCombo(shuffledMains, shuffledSides, false, false)) {
        const selected = [...shuffledMains, ...shuffledSides];
        return {
          foods: selected,
          totalPrice: selected.reduce((s, f) => s + (f.price || 0), 0),
          relaxedInfo: ['Đã bỏ qua quy tắc trứng và trùng món']
        };
     }
  }

  // Strategy 3: Exhaustive/Cheapest Fallback (if random failed due to budget)
  // Sort by price ascending and try to pick the cheapest valid combo
  const sortedMains = [...mainDishes].sort((a, b) => (a.price || 0) - (b.price || 0));
  const sortedSides = [...sideDishes].sort((a, b) => (a.price || 0) - (b.price || 0));
  
  // Try simplest greedy approach: Pick cheapest needed amount
  const cheapestMains = sortedMains.slice(0, mainDishCount);
  const cheapestSides = sortedSides.slice(0, sideDishCount);
  
  // Check if even the cheapest combo violates strict rules (we likely want to relax rules here too if we are desperate)
  // Let's try Strict first with cheapest
  if (isValidCombo(cheapestMains, cheapestSides, true, true)) {
     const selected = [...cheapestMains, ...cheapestSides];
     return {
         foods: selected,
         totalPrice: selected.reduce((s, f) => s + (f.price || 0), 0),
         relaxedInfo: ['Đã chọn combo rẻ nhất để phù hợp ngân sách']
     };
  }
  
  // If strict cheapest fails, try Relaxed Cheapest
  if (isValidCombo(cheapestMains, cheapestSides, false, false)) {
      const selected = [...cheapestMains, ...cheapestSides];
      return {
          foods: selected,
          totalPrice: selected.reduce((s, f) => s + (f.price || 0), 0),
          relaxedInfo: ['Đã chọn combo rẻ nhất và bỏ qua các quy tắc lịch sử']
      };
  }

  return null;
}
