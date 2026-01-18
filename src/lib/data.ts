import db from '@/lib/db';
import { Food } from '@/actions/food';
import { getUserId } from '@/actions/auth';

export interface MealHistory {
  id: number;
  date: string;
  food_ids: string; // JSON string [1, 2, 3]
}

export async function getAllFoods(): Promise<Food[]> {
  const userId = await getUserId();
  if (!userId) return [];

  const result = await db.execute({
    sql: 'SELECT * FROM foods WHERE user_id = ?',
    args: [userId]
  });
  // LibSQL rows might not be plain objects, spread them to be safe or JSON parse stringify
  return result.rows.map(row => ({ ...row })) as unknown as Food[];
}

export async function getMealHistory(limit = 7): Promise<MealHistory[]> {
  const userId = await getUserId();
  if (!userId) return [];

  const result = await db.execute({
    sql: 'SELECT * FROM meal_history WHERE user_id = ? ORDER BY date DESC LIMIT ?',
    args: [userId, limit]
  });
  return result.rows.map(row => ({ ...row })) as unknown as MealHistory[];
}

export async function saveMealHistory(foodIds: number[]) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const date = new Date().toISOString().split('T')[0];
  const foodIdsStr = JSON.stringify(foodIds);
  
  await db.execute({
    sql: 'INSERT INTO meal_history (date, food_ids, user_id) VALUES (?, ?, ?)',
    args: [date, foodIdsStr, userId]
  });
}
