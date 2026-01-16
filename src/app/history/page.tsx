import { getMealHistory, getAllFoods } from '@/lib/data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const revalidate = 0; // Always fresh

export default async function HistoryPage() {
  const history = await getMealHistory(20);
  const foods = await getAllFoods();
  
  // Create lookup map for foods
  const foodMap = new Map(foods.map(f => [f.id, f]));

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">📜 Lịch Sử Ăn Uống</h1>
      
      <div className="space-y-6">
        {history.map((record) => {
          const foodIds = JSON.parse(record.food_ids) as number[];
          const mealFoods = foodIds.map(id => foodMap.get(id)).filter(Boolean);
          const totalPrice = mealFoods.reduce((sum, f) => sum + (f?.price || 0), 0);

          return (
            <div key={record.id} className="border rounded-lg p-4 shadow-sm bg-white">
              <div className="flex justify-between items-center mb-2 border-b pb-2">
                <span className="font-bold text-gray-700">📅 {record.date}</span>
                <span className="text-sm font-medium text-green-600">Total: {totalPrice.toLocaleString()}đ</span>
              </div>
              <ul className="space-y-1">
                 {mealFoods.map((food, idx) => (
                   <li key={idx} className="flex gap-2 items-center">
                      <span className="text-lg">{food?.type === 'CHINH' ? '🍚' : '🥗'}</span>
                      <span>{food?.name}</span>
                   </li>
                 ))}
              </ul>
            </div>
          );
        })}

        {history.length === 0 && (
          <p className="text-center text-gray-500">Chưa có lịch sử. Hãy quay món ngay!</p>
        )}
      </div>

      <div className="mt-8 text-center flex gap-4">
        <Link href="/" className="flex-1">
          <Button variant="outline" className="w-full">🏠 Trang Chủ</Button>
        </Link>
        <Link href="/random" className="flex-1">
          <Button className="w-full bg-orange-500 hover:bg-orange-600">🎲 Quay Tiếp</Button>
        </Link>
      </div>
    </div>
  );
}
