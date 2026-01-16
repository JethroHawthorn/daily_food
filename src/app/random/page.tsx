'use client';

import { randomMeal, saveSelection } from '@/actions/random';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import Link from 'next/link';

// Need to duplicate Food interface or import it effectively if it was a plain object
interface Food {
  id: number;
  name: string;
  type: string;
  price: number | null;
  tags: string | null;
}

interface RandomResult {
  foods: Food[];
  totalPrice: number;
  relaxedInfo?: string[];
}

export default function RandomPage() {
  const [result, setResult] = useState<RandomResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRandom(formData: FormData) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await randomMeal(formData);
      if (res) {
        setResult(res);
      } else {
        setError('Không tìm thấy thực đơn phù hợp! Hãy thử tăng ngân sách hoặc thêm món ăn.');
      }
    } catch (e) {
      setError('Đã xảy ra lỗi hệ thống.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!result) return;
    try {
      await saveSelection(result.foods.map(f => f.id));
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">🎲 Random Món</h1>

      <form action={handleRandom} className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium mb-1">Ngân sách (VNĐ)</label>
          <Input name="budget" type="number" defaultValue="70000" step="1000" />
        </div>
        <Button type="submit" className="w-full h-12 text-lg bg-orange-500 hover:bg-orange-600" disabled={loading}>
          {loading ? 'Đang quay...' : 'QUAY NGAY'}
        </Button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4 text-center">
          {error}
        </div>
      )}

      {result && (
        <div className="border-2 border-green-500 rounded-xl p-4 bg-green-50 shadow-lg animate-in fade-in zoom-in duration-300">
          <h2 className="text-xl font-bold text-center mb-4 text-green-800">🎉 Thực Đơn Hôm Nay</h2>
          
          {result.relaxedInfo && result.relaxedInfo.length > 0 && (
             <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 text-sm rounded">
               ⚠️ {result.relaxedInfo.join(', ')}
             </div>
          )}

          <div className="space-y-3 mb-6">
            {result.foods.map((food, idx) => (
              <div key={idx} className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                <div>
                  <div className="font-bold flex items-center gap-2">
                    {food.type === 'CHINH' ? '🍚' : '🥗'} {food.name}
                  </div>
                  <div className="text-xs text-gray-500">{food.type}</div>
                </div>
                <div className="font-medium text-green-600">
                  {food.price ? food.price.toLocaleString() : 0}đ
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 flex justify-between items-center font-bold text-lg mb-6">
            <span>Tổng tiền:</span>
            <span>{result.totalPrice.toLocaleString()}đ</span>
          </div>

          <form action={handleSave}>
             <Button type="submit" className="w-full h-12 text-lg font-bold">
               ✅ Chốt Đơn Này
             </Button>
          </form>
        </div>
      )}
      
      <div className="mt-8 text-center">
        <Link href="/">
          <Button variant="outline">🏠 Về Trang Chủ</Button>
        </Link>
      </div>
    </div>
  );
}
