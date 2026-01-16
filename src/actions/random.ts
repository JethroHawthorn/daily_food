'use server';

import { getAllFoods, getMealHistory, saveMealHistory } from '@/lib/data';
import { generateRandomMeal } from '@/lib/random-engine';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function randomMeal(formData: FormData) {
  const budget = Number(formData.get('budget')) || 70000;
  
  // 1. Fetch data
  const foods = await getAllFoods();
  const history = await getMealHistory(7);
  
  // 2. Run Engine
  const result = generateRandomMeal(foods, history, {
    budget,
    mainDishCount: 1,
    sideDishCount: 1
  });
  
  return result;
}

export async function saveSelection(foodIds: number[]) {
  await saveMealHistory(foodIds);
  revalidatePath('/random');
  redirect('/');
}
