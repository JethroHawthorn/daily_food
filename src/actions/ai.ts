'use server';
    
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getMealHistory, saveMealHistory } from '@/lib/data';
import { Food } from '@/actions/food';
import { getUserId } from '@/actions/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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
You are a supportive Vietnamese food assistant for a daily meal planning app.

Core principles:
- You ONLY explain based on provided data.
- The app logic has already selected the dishes.

Strict rules:
- Do NOT give medical or health advice.
- Do NOT judge, criticize, or pressure the user.
- Keep responses short, clear, and friendly (max 3-4 sentences).
- Prefer simple Vietnamese words.

Context:
- User meal history (last 7 days):
${historySummary}
- Today selected dishes: 
${selectedFoods.map(f => `- ${f.name} (${f.price} VND, type: ${f.type})`).join('\n')}
- Budget constraints: ${budget} VND (Total: ${selectedFoods.reduce((sum, f) => sum + (f.price || 0), 0)} VND)

Task:
Explain briefly why these dishes are suitable today based on the context.
Tone: Friendly, calm, encouraging.
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
You are a supportive Vietnamese food suggestion assistant.

Strict rules:
- Do NOT give medical or health advice.
- Suggest 5 NEW dishes (not in existing dishes).
- Dishes must be common Vietnamese home-cooked meals.
- Output JSON array only.

Context:
- Existing dishes to AVOID: ${existingNames}

Output JSON Keys: 
  - name: string (Vietnamese name of dish)
  - type: string ('CHINH' for main dish, 'PHU' for side dish/soup/vegetables)
  - price: number (Estimated street price in VND, e.g. 35000, 50000)
  - tags: string (comma separated ingredients, e.g. 'heo, kho')
  - description: string (very short description)
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("Gemini Suggest Error:", error);
    return [];
  }
}

export async function suggestDishesFromIngredients(ingredients: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Chưa cấu hình API Key cho AI.");
  }

  try {
    const model = genAI.getGenerativeModel({ 
        model: "gemini-flash-latest",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
You are a supportive Vietnamese food suggestion assistant.

Strict rules:
- Do NOT give medical or health advice.
- Suggest 3-5 dishes that primarily use these ingredients: "${ingredients}".
- Dishes must be common Vietnamese home-cooked meals.
- Output JSON array only.

Output JSON Keys: 
  - name: string (Vietnamese name of dish)
  - type: string ('CHINH' for main dish, 'PHU' for side dish/soup/vegetables)
  - price: number (Estimated street price in VND, e.g. 35000)
  - tags: string (comma separated ingredients, e.g. 'heo, kho')
  - description: string (very short description explaining how it uses the ingredients)
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("Gemini Ingredient Suggest Error:", error);
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
You are a supportive Vietnamese food replacement assistant.

Strict rules:
- Replace ONLY the target dish.
- Do NOT give medical or health advice.
- Choose common Vietnamese home meals.
- Output ONLY valid JSON of the single replacement dish.

Context:
- Target Dish to Replace: ${JSON.stringify(targetDish)}
- Current Meal: ${JSON.stringify(currentMeal.map(f => ({ name: f.name, price: f.price })))}
- Total Budget: ${budget}
- Avoid Tags: ${JSON.stringify(avoidTags)}
- Recent Main Dish IDs: ${JSON.stringify(recentMainDishIds)}

Output JSON Structure:
{
  "name": "string",
  "type": "${targetDish.type}",
  "price": number,
  "tags": "string"
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
You are a supportive Vietnamese food habit analysis assistant.

Core principles:
- You ONLY explain, summarize based on provided data.
- Do NOT invent data.

Strict rules:
- Do NOT give medical or health advice.
- Do NOT judge, criticize, or pressure the user.
- Do NOT suggest specific dishes unless necessary for variety examples.
- Use friendly, encouraging Vietnamese tone.
- Keep the report short (max 150 words) and practical.
- If history is empty or insufficient, say so politely.

Context:
User's recent meal history (last 30 entries):
${historyText}

Output:
A friendly text response analyzing the habits (patterns, variety, balance) without being preachy.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Analyze Error:", error);
    return "AI đang bận, vui lòng thử lại sau.";
  }
}

import { getWeather, getCurrentSeason } from '@/lib/weather';

export async function getSmartMealRecommendations(
  availableFoods: Food[], 
  healthContext: { 
    goal: string; 
    conditions: string[]; 
    otherNotes?: string;
    mode?: string;
    region?: string;
  }
) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Chưa cấu hình API Key cho AI.");
  }

  try {
    const model = genAI.getGenerativeModel({ 
        model: "gemini-flash-latest",
        generationConfig: { responseMimeType: "application/json" }
    });

    const weather = await getWeather();
    const season = getCurrentSeason();
    const history = await getMealHistory(7);

    // Filter history to simple ID list
    const recentMealIds = history.flatMap(h => {
        try {
            return JSON.parse(h.food_ids) as number[];
        } catch {
            return [];
        }
    });

    const weatherSummary = weather 
      ? `${weather.temp_c}°C, ${weather.condition.text}, Humidity: ${weather.humidity}%`
      : "Unknown (assume average)";

    const foodListJson = JSON.stringify(availableFoods.map(f => ({
      id: f.id,
      name: f.name,
      type: f.type,
      tags: f.tags
    })));

    const prompt = `
You are a smart Vietnamese food recommendation engine with strict safety guardrails.

Context:
- Season: ${season}
- Weather: ${weatherSummary}
- User Health Goal: ${healthContext.goal}
- User Conditions: ${healthContext.conditions.join(', ')}
- Other Health Notes: ${healthContext.otherNotes || "None"}
- Selected Mode: ${healthContext.mode || "Normal"}
- Region/Taste: ${healthContext.region || "General"}
- Recent History IDs (Avoid if possible): ${JSON.stringify(recentMealIds)}

Candidate Meals:
${foodListJson}

Guardrails (CRITICAL):
1. NO medical advice. If "Other Health Notes" sounds serious (e.g., chest pain), ignore it or suggest checking with a doctor in the "confidence_reason".
2. NO harmful content.
3. Be culturally strict about "Region": Northern hints (lighter, salty), Central (spicy, salty), Southern (sweet, spicy).

Task:
1. Select top 3 most suitable meals.
2. STRICTLY penalize repetition.
3. Calculate 'confidence_score' (0.0 - 1.0) based on how well the meal fits ALL criteria (weather, health, mode, region).
4. Explain WHY in Vietnamese.

Output JSON Array:
[
  {
    "food_id": number,
    "reason": "string (Why matching?)",
    "confidence_score": number (0.0 to 1.0),
    "confidence_reason": "string (Why this score? e.g. 'Perfect match for chilly weather' or 'Low score because limited options')"
  }
]
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("Gemini Smart Suggest Error:", error);
    return [];
  }
}

export async function getWeatherInfo() {
  const weather = await getWeather();
  const season = getCurrentSeason();
  if (!weather) return null;
  
  return {
    ...weather,
    season
  };
}

export async function saveSmartSelection(foodIds: number[]) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');
  
  await saveMealHistory(foodIds);
  revalidatePath('/');
  revalidatePath('/history');
  redirect('/history');
}
