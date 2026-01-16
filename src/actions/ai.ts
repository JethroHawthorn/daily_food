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
