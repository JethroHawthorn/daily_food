'use client';

import { randomMeal, saveSelection } from '@/actions/random';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { generateRandomMeal } from '@/lib/random-engine';
import { getOfflineFoods, getOfflineHistory } from '@/hooks/use-offline-data';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ChefHat } from 'lucide-react';

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
  const [cooking, setCooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (result) {
      if (typeof window !== 'undefined' && window.navigator?.vibrate) {
        window.navigator.vibrate(200);
      }
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fb923c', '#f87171', '#fcd34d']
      });
    }
  }, [result]);

  async function handleRandom(formData: FormData) {
    setLoading(true);
    setCooking(true);
    setError(null);
    setResult(null);
    
    // Simulate cooking time for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));

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
      setCooking(false);
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
    <div className="container mx-auto p-4 max-w-md min-h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-6 text-center text-orange-950">
        {cooking ? 'Đang nấu nướng...' : '🎲 Random Món'}
      </h1>

      <AnimatePresence mode='wait'>
        {cooking ? (
          <motion.div 
            key="cooking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center space-y-4"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-6xl"
            >
              🥘
            </motion.div>
            <p className="text-orange-600 font-medium animate-pulse">Đang chọn nguyên liệu...</p>
          </motion.div>
        ) : (
          !result && (
            <motion.form 
              key="form"
              action={handleRandom} 
              className="space-y-6 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-orange-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-bold mb-2 text-orange-900">Món Chính</label>
                    <Input name="main_dish_count" type="number" defaultValue="1" min="1" max="5" className="bg-orange-50 border-orange-200 focus-visible:ring-orange-500 font-semibold" />
                 </div>
                 <div>
                    <label className="block text-sm font-bold mb-2 text-orange-900">Món Phụ</label>
                    <Input name="side_dish_count" type="number" defaultValue="1" min="0" max="5" className="bg-orange-50 border-orange-200 focus-visible:ring-orange-500 font-semibold" />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-orange-900">Ngân sách (VNĐ)</label>
                <div className="relative">
                  <Input 
                    name="budget" 
                    type="number" 
                    defaultValue="70000" 
                    step="1000" 
                    className="pl-8 text-lg font-semibold text-orange-900 bg-orange-50 border-orange-200 focus-visible:ring-orange-500"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400">$</span>
                </div>
              </div>
              <Button type="submit" className="w-full h-14 text-xl font-bold bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-200 rounded-xl transition-all active:scale-95" disabled={loading}>
                <ChefHat className="mr-2 w-6 h-6" />
                QUAY NGAY
              </Button>
            </motion.form>
          )
        )}
      </AnimatePresence>

      {error && !cooking && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 text-red-600 rounded-xl mb-4 text-center font-medium border border-red-100"
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence>
      {result && !cooking && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotate: -2 }} 
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          className="bg-white border-2 border-orange-200 rounded-2xl p-6 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-red-500" />
          
          <h2 className="text-2xl font-bold text-center mb-6 text-orange-900 flex items-center justify-center gap-2">
            <span>🎉</span> Thực Đơn Hôm Nay
          </h2>
          
           {result.isOffline && (
             <div className="mb-4 p-2 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider rounded text-center">
               📡 Offline Mode
             </div>
          )}

          {result.relaxedInfo && result.relaxedInfo.length > 0 && (
             <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-lg">
               ⚠️ {result.relaxedInfo.join(', ')}
             </div>
          )}

          <div className="space-y-4 mb-8">
            {result.foods.map((food, idx) => (
              <motion.div 
                key={idx} 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="flex justify-between items-center border-b border-orange-50 pb-3 last:border-0"
              >
                <div>
                  <div className="font-bold text-lg text-gray-800 flex items-center gap-3">
                    <span className="text-2xl">{food.type === 'CHINH' ? '🍚' : '🥗'}</span>
                    {food.name}
                  </div>
                  <div className="text-xs text-gray-400 pl-9 uppercase font-semibold tracking-wide">{food.type}</div>
                </div>
                <div className="font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  {food.price ? food.price.toLocaleString() : 0}đ
                </div>
              </motion.div>
            ))}
          </div>

          <div className="border-t-2 border-dashed border-gray-200 pt-4 flex justify-between items-center font-extrabold text-xl text-gray-800 mb-6">
            <span>Tổng cộng</span>
            <span>{result.totalPrice.toLocaleString()}đ</span>
          </div>

          <div className="space-y-3">
            <form action={handleSave}>
               <Button type="submit" className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700 shadow-green-200 shadow-lg rounded-xl" disabled={!!result.isOffline}>
                 {result.isOffline ? '❌ Online để lưu' : '✅ Chốt Đơn Này'}
               </Button>
            </form>
            
            <Button 
                variant="outline" 
                onClick={() => setResult(null)}
                className="w-full h-12 text-base font-semibold border-orange-200 text-orange-700 hover:bg-orange-50 rounded-xl"
            >
                🔄 Quay Lại
            </Button>
            
            <div className="text-center pt-2">
                 <Link href="/">
                    <Button variant="outline" className="text-gray-500 border-dashed border-gray-300 hover:border-orange-300 hover:text-orange-600">
                        🏠 Về Trang Chủ
                    </Button>
                 </Link>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
      
      {!result && !cooking && (
        <div className="mt-8 text-center">
            <Link href="/">
              <Button variant="outline">🏠 Về Trang Chủ</Button>
            </Link>
        </div>
      )}
    </div>
  );
}
