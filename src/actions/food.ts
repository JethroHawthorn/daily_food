'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getUserId } from '@/actions/auth';

export interface Food {
  id: number;
  name: string;
  type: string;
  price: number | null;
  tags: string | null;
}

export async function getFoods(): Promise<Food[]> {
  const userId = await getUserId();
  if (!userId) return [];

  const result = await db.execute({
    sql: 'SELECT * FROM foods WHERE user_id = ? ORDER BY id DESC',
    args: [userId]
  });
  // Serialize to plain object to pass to client component
  return JSON.parse(JSON.stringify(result.rows)) as Food[];
}

export async function getFood(id: number): Promise<Food | undefined> {
  const userId = await getUserId();
  if (!userId) return undefined;

  const result = await db.execute({
    sql: 'SELECT * FROM foods WHERE id = ? AND user_id = ?',
    args: [id, userId]
  });
  return result.rows[0] as unknown as Food | undefined;
}

export async function createFood(formData: FormData) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const price = formData.get('price') ? Number(formData.get('price')) : null;
  const tags = formData.get('tags') as string; // Stored as comma separated or raw text
  
  await db.execute({
    sql: 'INSERT INTO foods (name, type, price, tags, user_id) VALUES (?, ?, ?, ?, ?)',
    args: [name, type, price, tags, userId]
  });
  
  revalidatePath('/foods');
  redirect('/foods');
}

export async function updateFood(id: number, formData: FormData) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const price = formData.get('price') ? Number(formData.get('price')) : null;
  const tags = formData.get('tags') as string;
  
  await db.execute({
    sql: 'UPDATE foods SET name = ?, type = ?, price = ?, tags = ? WHERE id = ? AND user_id = ?',
    args: [name, type, price, tags, id, userId]
  });
  
  revalidatePath('/foods');
  redirect('/foods');
}

export async function deleteFood(id: number) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  await db.execute({
    sql: 'DELETE FROM foods WHERE id = ? AND user_id = ?',
    args: [id, userId]
  });
  
  revalidatePath('/foods');
}
