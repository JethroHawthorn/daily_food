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
      
      <div className="space-y-6 relative border-l-2 border-orange-200 ml-4 pl-6 pb-4">
        {history.map((record) => {
          const foodIds = JSON.parse(record.food_ids) as number[];
          const mealFoods = foodIds.map(id => foodMap.get(id)).filter(Boolean);
          const totalPrice = mealFoods.reduce((sum, f) => sum + (f?.price || 0), 0);
          const date = new Date(record.date).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' });

          return (
            <div key={record.id} className="relative">
              <div className="absolute -left-[33px] top-1 bg-orange-500 w-4 h-4 rounded-full border-4 border-white shadow-sm ring-1 ring-orange-200"></div>
              
              <h3 className="text-sm font-bold text-orange-900/60 uppercase tracking-widest mb-2">{date}</h3>
              
              <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-3">
                   {mealFoods.map((food, idx) => (
                     <div key={idx} className="flex justify-between items-center border-b border-dashed border-gray-100 last:border-0 pb-2 last:pb-0">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl bg-orange-50 w-10 h-10 flex items-center justify-center rounded-full">{food?.type === 'CHINH' ? '🍚' : '🥗'}</span>
                            <span className="font-semibold text-gray-700">{food?.name}</span>
                        </div>
                        <span className="text-sm font-medium text-orange-600">{food?.price?.toLocaleString()}đ</span>
                     </div>
                   ))}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs text-gray-400">Tổng cộng</span>
                    <span className="font-bold text-lg text-gray-800">{totalPrice.toLocaleString()}đ</span>
                </div>
              </div>
            </div>
          );
        })}

        {history.length === 0 && (
          <div className="text-center py-10">
              <div className="text-4xl mb-4">😿</div>
              <p className="text-gray-500">Chưa có lịch sử. Hãy quay món ngay!</p>
          </div>
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
