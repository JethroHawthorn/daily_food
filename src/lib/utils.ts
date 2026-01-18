import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFoodIcon(name: string, type: string): string {
  const lowerName = name.toLowerCase();
  
  // Specific dishes
  if (lowerName.includes('phở')) return '🍜';
  if (lowerName.includes('cơm')) return '🍚';
  if (lowerName.includes('bún')) return '🍜';
  if (lowerName.includes('mì')) return '🍜';
  if (lowerName.includes('miến')) return '🍜';
  if (lowerName.includes('cháo')) return '🥣';
  if (lowerName.includes('lẩu')) return '🥘';
  if (lowerName.includes('bánh mì')) return '🥖';
  if (lowerName.includes('pizza')) return '🍕';
  if (lowerName.includes('burger')) return '🍔';
  if (lowerName.includes('gà')) return '🍗';
  if (lowerName.includes('cá')) return '🐟';
  if (lowerName.includes('bò')) return '🥩';
  if (lowerName.includes('tôm')) return '🦐';
  if (lowerName.includes('trứng')) return '🥚';
  if (lowerName.includes('rau')) return '🥬';
  if (lowerName.includes('salad')) return '🥗';
  if (lowerName.includes('canh')) return '🍲';
  if (lowerName.includes('súp')) return '🥣';
  if (lowerName.includes('kho')) return '🥘';
  if (lowerName.includes('xào')) return '🥘';
  if (lowerName.includes('nướng')) return '🍖';
  if (lowerName.includes('hấp')) return '🥟';
  if (lowerName.includes('luộc')) return '🥦';
  if (lowerName.includes('tráng miệng')) return '🍰';
  if (lowerName.includes('chè')) return '🥣';
  if (lowerName.includes('kem')) return '🍦';
  if (lowerName.includes('sinh tố')) return '🥤';
  if (lowerName.includes('nước')) return '🥤';
  
  // Fallback by type
  if (type === 'CHINH') return '🍱';
  if (type === 'PHU') return '🥗';
  
  return '🍽️';
}
