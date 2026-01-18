'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { suggestNewDishes, suggestDishesFromIngredients } from '@/actions/ai';
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
      setSuggestions([]); 
    } finally {
      setLoading(false);
    }
  }

  async function handleIngredientSuggest(ingredients: string) {
    setLoading(true);
    setSuggestions([]);
    try {
       const result = await suggestDishesFromIngredients(ingredients);
       setSuggestions(result);
    } catch (e) {
       console.error(e);
       setSuggestions([]);
    } finally {
       setLoading(false);
    }
  }

  return (
    <div className="mb-6">
      <div className="flex gap-2 mb-4">
        <Button 
            onClick={handleSuggest} 
            disabled={loading}
            variant="outline"
            className="flex-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200 border-dashed"
        >
            {loading && !isOpen ? '...' : '✨ Món mới'}
        </Button>
        <Button 
            onClick={() => setIsOpen(!isOpen)} 
            disabled={loading}
            variant="outline"
            className="flex-1 bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200 border-dashed"
        >
            🥕 Nguyên liệu
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
            <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-4"
            >
                <div className="bg-white border rounded-lg p-4 shadow-sm space-y-3">
                    <h3 className="font-bold text-gray-700">Gợi ý từ AI:</h3>
                    
                    {/* Ingredient Input Area */}
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Nhập nguyên liệu (vd: trứng, cà chua)..."
                            className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                            id="ingredient-input"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const val = e.currentTarget.value;
                                    if(val) handleIngredientSuggest(val);
                                }
                            }}
                        />
                        <Button 
                            size="sm"
                            onClick={() => {
                                const input = document.getElementById('ingredient-input') as HTMLInputElement;
                                if(input?.value) handleIngredientSuggest(input.value);
                            }}
                            disabled={loading}
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            Tìm
                        </Button>
                    </div>

                    {loading && <p className="text-sm text-gray-400 italic">AI đang suy nghĩ...</p>}
               
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
