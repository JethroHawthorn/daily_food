'use server';

import { getAllFoods, getMealHistory, saveMealHistory } from '@/lib/data';
import { generateRandomMeal } from '@/lib/random-engine';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function randomMeal(formData: FormData) {
  const budget = Number(formData.get('budget')) || 70000;
  
const mainDishCountRaw = formData.get('main_dish_count');
  const mainDishCount = mainDishCountRaw !== null ? Number(mainDishCountRaw) : 1;
  
  const sideDishCountRaw = formData.get('side_dish_count');
  const sideDishCount = sideDishCountRaw !== null ? Number(sideDishCountRaw) : 1;
  
  // 1. Fetch data
  const foods = await getAllFoods();
  const history = await getMealHistory(7);
  
  // 2. Run Engine
  const result = generateRandomMeal(foods, history, {
    budget,
    mainDishCount,
    sideDishCount
  });
  
  return result;
}

export async function saveSelection(foodIds: number[]) {
  await saveMealHistory(foodIds);
  revalidatePath('/random');
  redirect('/');
}
