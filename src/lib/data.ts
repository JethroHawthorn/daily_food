import db from '@/lib/db';
import { Food } from '@/actions/food';

export interface MealHistory {
  id: number;
  date: string;
  food_ids: string; // JSON string [1, 2, 3]
}

export async function getAllFoods(): Promise<Food[]> {
  const result = await db.execute('SELECT * FROM foods');
  // LibSQL rows might not be plain objects, spread them to be safe or JSON parse stringify
  return result.rows.map(row => ({ ...row })) as unknown as Food[];
}

export async function getMealHistory(limit = 7): Promise<MealHistory[]> {
  const result = await db.execute({
    sql: 'SELECT * FROM meal_history ORDER BY date DESC LIMIT ?',
    args: [limit]
  });
  return result.rows.map(row => ({ ...row })) as unknown as MealHistory[];
}

export async function saveMealHistory(foodIds: number[]) {
  const date = new Date().toISOString().split('T')[0];
  const foodIdsStr = JSON.stringify(foodIds);
  
  await db.execute({
    sql: 'INSERT INTO meal_history (date, food_ids) VALUES (?, ?)',
    args: [date, foodIdsStr]
  });
}
