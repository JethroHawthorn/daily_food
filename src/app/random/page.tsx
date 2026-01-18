'use client';

import { randomMeal, saveSelection } from '@/actions/random';
import { replaceDish, explainMealSelection } from '@/actions/ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { generateRandomMeal } from '@/lib/random-engine';
import { getOfflineFoods, getOfflineHistory } from '@/hooks/use-offline-data';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ChefHat, RefreshCw, Loader2, Check, RotateCcw, Home } from 'lucide-react';

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
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [replacingId, setReplacingId] = useState<number | null>(null);

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
    setError(null);
    setResult(null);
    setExplanation(null);
    
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await handleRandom(formData);
  }

  async function handleExplain() {
    if (!result || !result.foods) return;
    setIsExplaining(true);
    // Ideally pass real budget
    try {
        const text = await explainMealSelection(result.foods, result.totalPrice); 
        setExplanation(text);
    } catch (e) {
        console.error(e);
        setExplanation('Có lỗi khi gọi AI.');
    } finally {
        setIsExplaining(false);
    }
  }

  async function handleReplace(dish: Food) {
    if (!result) return;
    setReplacingId(dish.id);
    try {
      const estimatedBudget = Math.max(result.totalPrice, 70000); 

      // Recent main dish IDs - we can't easily get them from history here without extra calls.
      // Let's pass empty array for now or if we stored them in state.
      const newDish = await replaceDish(dish, result.foods, estimatedBudget);
      
      if (newDish) {
        setResult(prev => {
           if (!prev) return null;
           const newFoods = prev.foods.map(f => f.id === dish.id ? { ...newDish, id: Date.now() } : f); // Temp ID for new dish
           return {
             ...prev,
             foods: newFoods,
             totalPrice: newFoods.reduce((s, f) => s + (f.price || 0), 0)
           };
        });
        setExplanation(null); // Clear old explanation
      } else {
        alert('AI không tìm thấy món thay thế phù hợp!');
      }
    } catch (e) {
      console.error(e);
      alert('Lỗi khi đổi món: ' + (e as Error).message);
    } finally {
      setReplacingId(null);
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-md min-h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-6 text-center text-orange-950">
        {loading ? 'Đang chọn món...' : '🎲 Random Món'}
      </h1>

      <AnimatePresence mode='wait'>
          {!result && (
            <motion.form 
              key="form"
              onSubmit={handleSubmit} 
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
                {loading ? (
                    <Loader2 className="mr-2 w-6 h-6 animate-spin" />
                ) : (
                    <ChefHat className="mr-2 w-6 h-6" />
                )}
                {loading ? 'ĐANG CHỌN...' : 'QUAY NGAY'}
              </Button>
            </motion.form>
          )}
      </AnimatePresence>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 text-red-600 rounded-xl mb-4 text-center font-medium border border-red-100"
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence>
      {result && (
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
                <div className="flex items-center gap-2">
                  <div className="font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                    {food.price ? food.price.toLocaleString() : 0}đ
                  </div>
                  {!result.isOffline && (
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleReplace(food)}
                      disabled={replacingId === food.id}
                      className={`h-8 w-8 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-full ${replacingId === food.id ? 'animate-spin text-orange-500' : ''}`}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="border-t-2 border-dashed border-gray-200 pt-4 flex justify-between items-center font-extrabold text-xl text-gray-800 mb-6">
            <span>Tổng cộng</span>
            <span>{result.totalPrice.toLocaleString()}đ</span>
          </div>

          {explanation && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900 text-sm leading-relaxed"
            >
                <div className="flex gap-2 items-start">
                    <span className="text-lg">✨</span>
                    <p>{explanation}</p>
                </div>
            </motion.div>
          )}

          <div className="mb-4">
            {!explanation && !result.isOffline && (
                 <Button 
                    variant="ghost"
                    onClick={handleExplain}
                    disabled={isExplaining}
                    className="w-full text-indigo-600 bg-indigo-50 hover:text-indigo-700 hover:bg-indigo-100 border border-dashed border-indigo-200"
                 >
                    {isExplaining ? 'AI đang suy nghĩ...' : '✨ Tại sao chọn món này?'}
                 </Button>
            )}
          </div>

          <div className="space-y-3">
            <form action={handleSave}>
               <Button type="submit" className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700 shadow-green-200 shadow-lg rounded-xl flex items-center justify-center gap-2" disabled={!!result.isOffline}>
                 {result.isOffline ? (
                    <>
                        <span>❌</span>
                        <span>Online để lưu</span>
                    </>
                 ) : (
                    <>
                        <Check className="w-5 h-5" />
                        <span>Chốt Đơn Này</span>
                    </>
                 )}
               </Button>
            </form>
            
            <Button 
                variant="outline" 
                onClick={() => setResult(null)}
                className="w-full h-12 text-base font-semibold border-orange-200 text-orange-700 hover:bg-orange-50 rounded-xl flex items-center justify-center gap-2"
            >
                <RotateCcw className="w-5 h-5" />
                <span>Quay Lại</span>
            </Button>
            
            <div className="flex justify-center pt-2 w-full">
                 <Link href="/">
                    <Button variant="outline" className="text-gray-500 border-dashed border-gray-300 hover:border-orange-300 hover:text-orange-600 flex items-center justify-center gap-2">
                        <Home className="w-4 h-4" />
                        <span>Về Trang Chủ</span>
                    </Button>
                 </Link>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
      
      {!result && (
        <div className="mt-8 flex justify-center w-full">
            <Link href="/">
              <Button variant="outline" className="flex items-center justify-center gap-2">
                <Home className="w-4 h-4" />
                <span>Về Trang Chủ</span>
              </Button>
            </Link>
        </div>
      )}
    </div>
  );
}
