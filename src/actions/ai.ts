'use server';
    
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getMealHistory } from '@/lib/data';
import { Food } from '@/actions/food';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function explainMealSelection(selectedFoods: Food[], budget: number) {
  if (!process.env.GEMINI_API_KEY) {
    return "Chưa cấu hình API Key cho AI.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const history = await getMealHistory(7);
    
    // Simplify history for prompt
    const historySummary = history.map(h => {
        // We only have IDs in history, this might be tricky if we don't fetch the names.
        // For now, let's just pass the raw IDs or if we want better context, we might need to fetch names.
        // But the prompt said "User meal history (7 days)".
        // Let's check what getMealHistory returns. It returns {date, food_ids}.
        // Without food names, history is less useful for the AI.
        // However, fetching all food names for history might be heavy.
        // Let's try to just mention "History contains meal IDs: ..." or minimal info.
        // BETTER APPROACH: The prompt context requires "User meal history".
        // Providing just IDs isn't helpful for the AI to know DIVERSITY.
        // The previous random engine loaded ALL foods. Maybe we should rely on the fact that
        // the AI can infer from the "selected dishes" vs "suitability".
        
        // Wait, if I want to do this right, I should map IDs to meaningful text.
        // But `getMealHistory` just returns data.
        // Let's look at `random-engine.ts`. It takes `foods` array and `history`.
        // It uses `foods` to look up names if needed.
        return `${h.date}: ${h.food_ids}`; 
    }).join('\n');

    // To make history meaningful, we probably need the names.
    // But `selectedFoods` are the ones we need to explain.
    // Let's assume the AI mainly needs to justify the CURRENT selection based on generic rules 
    // and maybe mention "Not in history" if we can simply say that.
    
    // Let's stick to the prompt requirements.
    // "Context: User meal history (7 days), Today selected dishes, Budget constraints"
    
    const prompt = `
You are a food assistant "Food Daily".
Context:
- User meal history (last 7 days - format 'Date: [Food IDs]'):
${historySummary}
(Note: Food IDs are internal, just ensure the current selection isn't a direct repetition of recent exact matches if possible, or just focus on the current selection's balance).
- Today selected dishes: 
${selectedFoods.map(f => `- ${f.name} (${f.price} VND, type: ${f.type})`).join('\n')}
- Budget constraints: ${budget} VND (Total: ${selectedFoods.reduce((sum, f) => sum + (f.price || 0), 0)} VND)

Task:
Explain briefly why these dishes are suitable today.
Do NOT suggest new dishes unless asked.
Respond in Vietnamese.
Limit to 3–4 sentences.
Tone: Friendly, helpful.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Xin lỗi, AI đang bận nấu ăn nên chưa thể giải thích lúc này.";
  }
}

export async function suggestNewDishes(existingFoods: Food[]) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Chưa cấu hình API Key cho AI.");
  }

  try {
    const model = genAI.getGenerativeModel({ 
        model: "gemini-flash-latest",
        generationConfig: { responseMimeType: "application/json" }
    });

    const existingNames = existingFoods.map(f => f.name.toLowerCase()).join(', ');

    const prompt = `
You are a Vietnamese food suggestion assistant.

Context:
- Existing dishes to AVOID: ${existingNames}

Rules:
- Suggest 5 NEW dishes (not in existing dishes).
- Dishes must be common Vietnamese home-cooked meals.
- Do NOT include expensive or rare ingredients.
- Output JSON array only.
- Keys: 
  - name: string (Vietnamese name of dish)
  - type: string ('CHINH' for main dish, 'PHU' for side dish/soup/vegetables)
  - tags: string (comma separated ingredients/attributes, e.g. 'heo, kho')
  - description: string (very short description of what it is)
- Do NOT include prices (I will set them later).
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("Gemini Suggest Error:", error);
    return [];
  }
}

export async function replaceDish(
  targetDish: Food,
  currentMeal: Food[],
  budget: number,
  avoidTags: string[] = [],
  recentMainDishIds: number[] = []
) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Chưa cấu hình API Key cho AI.");
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
You are a Vietnamese food replacement assistant.

Strict rules:
- Replace ONLY the target dish
- Do NOT modify other dishes
- Do NOT exceed remainingBudget
- Suggest dishes with the SAME type as target dish
- Avoid dishes with tags listed in avoidTags
- Avoid dishes appearing in recentMainDishIds
- Choose common Vietnamese home meals
- Do NOT explain anything
- Output ONLY valid JSON of the single replacement dish

Context:
- Target Dish to Replace: ${JSON.stringify(targetDish)}
- Current Meal: ${JSON.stringify(currentMeal.map(f => ({ name: f.name, price: f.price })))}
- Total Budget: ${budget}
- Remaining Budget for this dish (approx): ${budget - currentMeal.filter(f => f.id !== targetDish.id).reduce((s, f) => s + (f.price || 0), 0)}
- Avoid Tags: ${JSON.stringify(avoidTags)}
- Recent Main Dish IDs (avoid names if possible): ${JSON.stringify(recentMainDishIds)}

Output JSON Structure:
{
  "name": "string",
  "type": "${targetDish.type}",
  "price": number,
  "tags": "string",
  "image": null
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const cleanText = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini Replace Error:", error);
    return null;
  }
}
// ... existing exports

export async function analyzeFoodHabits() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Chưa cấu hình API Key cho AI.");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    // Fetch data
    const history = await getMealHistory(30); // Last 30 entries
    const allFoods = await import('@/lib/data').then(m => m.getAllFoods()); // Dynamic import to avoid circular dep if any
    const foodMap = new Map(allFoods.map(f => [f.id, f]));

    if (history.length === 0) {
      return "Bạn chưa có lịch sử ăn uống nào để phân tích. Hãy quay thử vài món nhé!";
    }

    // Process history into readable text
    const historyText = history.map(h => {
      const foods = (JSON.parse(h.food_ids) as number[])
        .map(id => foodMap.get(id)?.name)
        .filter(Boolean)
        .join(', ');
      return `- ${new Date(h.date).toLocaleDateString('vi-VN')}: ${foods}`;
    }).join('\n');

    const prompt = `
You are a Vietnamese food habit analysis assistant.

Strict rules:
- Do NOT give medical or health advice
- Do NOT judge or criticize the user
- Do NOT suggest specific dishes
- Only analyze patterns and balance (e.g. eating too much fried food, good variety, repeating dishes)
- Use friendly, encouraging Vietnamese tone
- Keep the report short (max 150 words) and practical

Context:
User's recent meal history (last 30 entries):
${historyText}

Output:
A text response analyzing the habits.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Analyze Error:", error);
    return "AI đang bận, vui lòng thử lại sau.";
  }
}
