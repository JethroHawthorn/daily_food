'use server';

import { getAllFoods as getFoods, getMealHistory as getHistory } from '@/lib/data';

// Simple wrappers to expose data to client for caching
export async function getAllFoods() {
  const foods = await getFoods();
  // Ensure plain objects
  return foods.map(f => ({...f}));
}

export async function getMealHistory() {
  const history = await getHistory(20); // Sync last 20 meals for safety
  return history.map(h => ({...h}));
}
