'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { suggestNewDishes } from '@/actions/ai';
import { createFood, Food } from '@/actions/food';
import { motion, AnimatePresence } from 'framer-motion';

export function AISuggestion({ existingFoods }: { existingFoods: Food[] }) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  async function handleSuggest() {
    setLoading(true);
    setIsOpen(true);
    setSuggestions([]);
    try {
      const result = await suggestNewDishes(existingFoods);
      setSuggestions(result);
    } catch (e) {
      console.error(e);
      setSuggestions([]); // Error state could be better
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6">
      <Button 
        onClick={handleSuggest} 
        disabled={loading}
        className="w-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 border-dashed mb-4"
      >
        {loading ? 'AI đang tìm món mới...' : '✨ Gợi ý món mới chưa có'}
      </Button>

      <AnimatePresence>
        {isOpen && (suggestions.length > 0 || loading) && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border rounded-lg p-4 shadow-sm space-y-3">
               <h3 className="font-bold text-gray-700">Gợi ý từ AI:</h3>
               {loading && <p className="text-sm text-gray-400 italic">Đang suy nghĩ...</p>}
               
               {suggestions.map((dish, idx) => (
                 <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                        <div className="font-bold text-indigo-900 flex items-center gap-2">
                           {dish.name}
                           <span className="text-xs font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                             {dish.price?.toLocaleString()}đ
                           </span>
                        </div>
                        <div className="text-xs text-gray-500">{dish.description}</div>
                        <div className="text-xs text-indigo-400 mt-1 uppercase font-semibold">{dish.type}</div>
                    </div>
                    <form action={async () => {
                        const formData = new FormData();
                        formData.set('name', dish.name);
                        formData.set('type', dish.type);
                        formData.set('price', (dish.price || 0).toString()); 
                        formData.set('tags', dish.tags);
                        await createFood(formData);
                        // Remove from list
                        setSuggestions(prev => prev.filter((_, i) => i !== idx));
                    }}>
                        <Button size="sm" type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                            + Thêm
                        </Button>
                    </form>
                 </div>
               ))}
               
               {!loading && suggestions.length === 0 && (
                 <p className="text-sm text-red-400">Không tìm thấy gợi ý hoặc có lỗi.</p>
               )}
               
               <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="w-full text-gray-400 mt-2">
                 Đóng
               </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
