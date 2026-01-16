'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface Food {
  id: number;
  name: string;
  type: string;
  price: number | null;
  image: string | null;
  tags: string | null;
}

export async function getFoods(): Promise<Food[]> {
  const result = await db.execute('SELECT * FROM foods ORDER BY id DESC');
  return result.rows as unknown as Food[];
}

export async function getFood(id: number): Promise<Food | undefined> {
  const result = await db.execute({
    sql: 'SELECT * FROM foods WHERE id = ?',
    args: [id]
  });
  return result.rows[0] as unknown as Food | undefined;
}

export async function createFood(formData: FormData) {
  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const price = formData.get('price') ? Number(formData.get('price')) : null;
  
  await db.execute({
    sql: 'INSERT INTO foods (name, type, price) VALUES (?, ?, ?)',
    args: [name, type, price]
  });
  
  revalidatePath('/foods');
  redirect('/foods');
}

export async function updateFood(id: number, formData: FormData) {
  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const price = formData.get('price') ? Number(formData.get('price')) : null;
  
  await db.execute({
    sql: 'UPDATE foods SET name = ?, type = ?, price = ? WHERE id = ?',
    args: [name, type, price, id]
  });
  
  revalidatePath('/foods');
  redirect('/foods');
}

export async function deleteFood(id: number) {
  await db.execute({
    sql: 'DELETE FROM foods WHERE id = ?',
    args: [id]
  });
  
  revalidatePath('/foods');
}
