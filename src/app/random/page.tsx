'use client';

import { randomMeal, saveSelection } from '@/actions/random';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import Link from 'next/link';
import { generateRandomMeal } from '@/lib/random-engine';
import { getOfflineFoods, getOfflineHistory } from '@/hooks/use-offline-data';
import { motion, AnimatePresence } from 'framer-motion';

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
  isOffline?: boolean;
}

export default function RandomPage() {
  const [result, setResult] = useState<RandomResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRandom(formData: FormData) {
    setLoading(true);
    setError(null);
    setResult(null);
    
    const budget = Number(formData.get('budget')) || 70000;

    try {
      // Try Server Action first
      const res = await randomMeal(formData);
      if (res) {
        setResult(res);
      } else {
        setError('Không tìm thấy thực đơn phù hợp (Online).');
      }
    } catch (e) {
      console.log('Online failed, trying offline...', e);
      // Fallback to offline
      const offlineFoods = getOfflineFoods();
      const offlineHistory = getOfflineHistory();
      
      if (offlineFoods.length === 0) {
        setError('Mất kết nối và chưa có dữ liệu offline. Hãy kết nối mạng để tải dữ liệu.');
      } else {
        const offlineRes = generateRandomMeal(offlineFoods, offlineHistory, {
           budget,
           mainDishCount: 1,
           sideDishCount: 1
        });
        
        if (offlineRes) {
          setResult({ ...offlineRes, isOffline: true });
        } else {
           setError('Không tìm thấy thực đơn phù hợp (Offline).');
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!result) return;
    try {
      await saveSelection(result.foods.map(f => f.id));
    } catch (e) {
      console.error('Save failed', e);
      alert('Không thể lưu khi mất mạng (tính năng lưu offline chưa hỗ trợ).');
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
        <Button type="submit" className="w-full h-12 text-lg bg-orange-500 hover:bg-orange-600 transition-all active:scale-95" disabled={loading}>
          {loading ? 'Đang quay...' : 'QUAY NGAY'}
        </Button>
      </form>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 text-red-600 rounded-lg mb-4 text-center"
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence>
      {result && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="border-2 border-green-500 rounded-xl p-4 bg-green-50 shadow-lg"
        >
          <h2 className="text-xl font-bold text-center mb-4 text-green-800">🎉 Thực Đơn Hôm Nay</h2>
          
           {result.isOffline && (
             <div className="mb-4 p-2 bg-gray-200 text-gray-700 text-sm rounded text-center">
               📡 Chế độ Offline (Dữ liệu cũ)
             </div>
          )}

          {result.relaxedInfo && result.relaxedInfo.length > 0 && (
             <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 text-sm rounded">
               ⚠️ {result.relaxedInfo.join(', ')}
             </div>
          )}

          <div className="space-y-3 mb-6">
            {result.foods.map((food, idx) => (
              <motion.div 
                key={idx} 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="flex justify-between items-center bg-white p-3 rounded shadow-sm"
              >
                <div>
                  <div className="font-bold flex items-center gap-2">
                    {food.type === 'CHINH' ? '🍚' : '🥗'} {food.name}
                  </div>
                  <div className="text-xs text-gray-500">{food.type}</div>
                </div>
                <div className="font-medium text-green-600">
                  {food.price ? food.price.toLocaleString() : 0}đ
                </div>
              </motion.div>
            ))}
          </div>

          <div className="border-t pt-4 flex justify-between items-center font-bold text-lg mb-6">
            <span>Tổng tiền:</span>
            <span>{result.totalPrice.toLocaleString()}đ</span>
          </div>

          <form action={handleSave}>
             <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={!!result.isOffline}>
               {result.isOffline ? '❌ Online để lưu' : '✅ Chốt Đơn Này'}
             </Button>
          </form>
        </motion.div>
      )}
      </AnimatePresence>
      
      <div className="mt-8 text-center">
        <Link href="/">
          <Button variant="outline">🏠 Về Trang Chủ</Button>
        </Link>
      </div>
    </div>
  );
}
