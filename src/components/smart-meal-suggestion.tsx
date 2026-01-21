'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Food } from '@/actions/food';
import { getSmartMealRecommendations, getWeatherInfo, saveSmartSelection } from '@/actions/ai';
import { CloudSun, Info, Loader2, ThermometerSun } from 'lucide-react';

interface Props {
  foods: Food[];
}

export function SmartMealSuggestion({ foods }: Props) {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  
  const [goal, setGoal] = useState('maintain');
  const [conditions, setConditions] = useState<string[]>([]);
  const [otherNotes, setOtherNotes] = useState('');
  const [mode, setMode] = useState('');
  const [region, setRegion] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    getWeatherInfo().then(setWeather);
  }, []);

  async function handleRecommend() {
    if (foods.length === 0) {
        alert("Bạn chưa có món ăn nào trong danh sách. Hãy thêm món trước nhé!");
        return;
    }
    setLoading(true);
    try {
      const res = await getSmartMealRecommendations(foods, {
        goal,
        conditions,
        otherNotes,
        mode,
        region
      });
      setSuggestions(res);
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi gọi AI.");
    } finally {
      setLoading(false);
    }
  }

  const toggleCondition = (c: string) => {
    setConditions(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Weather Header */}
      <div className="bg-gradient-to-br from-blue-50 to-sky-100 p-4 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden">
        <div className="flex items-start justify-between relative z-10">
            <div>
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1">Thời tiết hôm nay</p>
                {weather ? (
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-blue-900">{weather.temp_c}°C</span>
                        <span className="text-sm text-blue-700 mb-1 font-medium">{weather.condition?.text}</span>
                    </div>
                ) : (
                    <div className="h-9 flex items-center"><Loader2 className="w-4 h-4 animate-spin text-blue-400" /></div>
                )}
                {weather && (
                    <div className="flex gap-3 mt-2 text-xs text-blue-600">
                        <div className='flex items-center gap-1'><ThermometerSun className='w-3 h-3'/> Độ ẩm: {weather.humidity}%</div>
                        <div className='bg-white/50 px-2 py-0.5 rounded-full'>{weather.season}</div>
                    </div>
                )}
            </div>
            <CloudSun className="w-12 h-12 text-blue-400/50 absolute right-0 top-0 mt-2 mr-2" />
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        
        <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Chế độ gợi ý</label>
            <div className="flex flex-wrap gap-2">
                {[
                    { val: 'quick', label: '⚡️ Nấu nhanh' },
                    { val: 'healthy', label: '🥗 Healthy' },
                    { val: 'comfort', label: '🍲 Comfort Food' },
                    { val: 'budget', label: '💰 Tiết kiệm' },
                    { val: 'family', label: '👨‍👩‍👧‍👦 Gia đình' }
                ].map((m) => (
                    <button
                        key={m.val}
                        onClick={() => setMode(m.val === mode ? '' : m.val)}
                        className={`text-xs py-1.5 px-3 rounded-full border transition-all ${
                            mode === m.val
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold ring-2 ring-indigo-100'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>
        </div>

        <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Khẩu vị miền</label>
            <div className="flex gap-2">
                {[
                    { val: 'north', label: 'Miền Bắc' },
                    { val: 'central', label: 'Miền Trung' },
                    { val: 'south', label: 'Miền Nam' }
                ].map((r) => (
                    <button
                        key={r.val}
                        onClick={() => setRegion(r.val === region ? '' : r.val)}
                        className={`text-xs py-1.5 px-3 rounded-full border transition-all ${
                            region === r.val
                            ? 'bg-red-50 border-red-200 text-red-700 font-bold ring-2 ring-red-100'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        {r.label}
                    </button>
                ))}
            </div>
        </div>

        <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Mục tiêu sức khoẻ</label>
            <div className="grid grid-cols-3 gap-2">
                {[
                    { val: 'lose_weight', label: 'Giảm cân' },
                    { val: 'maintain', label: 'Duy trì' },
                    { val: 'gain_weight', label: 'Tăng cân' }
                ].map((opt) => (
                    <button
                        key={opt.val}
                        onClick={() => setGoal(opt.val)}
                        className={`text-sm py-2 px-1 rounded-lg border transition-all ${
                            goal === opt.val 
                            ? 'bg-green-50 border-green-200 text-green-700 font-bold ring-2 ring-green-100' 
                            : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>

        <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Lưu ý đặc biệt (Tuỳ chọn)</label>
            <div className="flex flex-wrap gap-2">
                {[
                    { val: 'low_carb', label: 'Low Carb' },
                    { val: 'low_sugar', label: 'Ít đường' },
                    { val: 'vegetarian', label: 'Chay' },
                    { val: 'gluten_free', label: 'No Gluten' }
                ].map((cond) => (
                    <button
                        key={cond.val}
                        onClick={() => toggleCondition(cond.val)}
                        className={`text-xs py-1.5 px-3 rounded-full border transition-all ${
                            conditions.includes(cond.val)
                            ? 'bg-orange-50 border-orange-200 text-orange-700 font-semibold'
                            : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        {cond.label}
                    </button>
                ))}
            </div>
        </div>

        <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Ghi chú khác (Tuỳ chọn)</label>
            <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Ví dụ: đang bị cảm, đau họng, muốn ăn đồ nước..."
                rows={2}
                value={otherNotes}
                onChange={(e) => setOtherNotes(e.target.value)}
            />
        </div>

        <Button 
            onClick={handleRecommend} 
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-6 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '✨ Gợi ý món ăn phù hợp'}
        </Button>
      </div>

      {/* Results */}
      <div className={`space-y-3 ${selectedIds.length > 0 ? 'pb-24' : ''}`}>
        {suggestions.map((item, idx) => {
            const food = foods.find(f => f.id === item.food_id);
            if (!food) return null; // Should not happen

            const confidencePercent = Math.round((item.confidence_score || 0) * 100);
            const getConfidenceColor = (score: number) => {
                if (score >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
                if (score >= 0.5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
                return 'text-gray-500 bg-gray-50 border-gray-200';
            }

            return (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-xl p-4 border border-indigo-100 shadow-md flex gap-4 overflow-hidden relative"
                >
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                             <div className="text-lg font-extrabold text-gray-800">{food.name}</div>
                             {item.confidence_score && (
                                <div className={`text-xs px-2 py-0.5 rounded-full border font-bold ${getConfidenceColor(item.confidence_score)}`}>
                                    {confidencePercent}% Match
                                </div>
                             )}
                        </div>
                        <div className="text-indigo-600 text-sm font-medium mb-1">
                             {food.price?.toLocaleString()}đ <span className='text-gray-300'>•</span> {food.type}
                        </div>
                        <div className="text-gray-500 text-xs bg-indigo-50 p-2 rounded-lg mt-2 italic">
                             <div className="flex gap-2 items-start">
                                <Info className="w-3 h-3 mt-0.5 shrink-0" />
                                {item.reason}
                             </div>
                             {item.confidence_reason && (
                                <div className="mt-1 pl-5 text-indigo-400 opacity-80">
                                   ℹ️ {item.confidence_reason}
                                </div>
                             )}
                        </div>
                        <div className="mt-3">
                            <Button 
                                size="sm" 
                                variant={selectedIds.includes(food.id) ? "default" : "outline"}
                                className={`w-full transition-all ${
                                    selectedIds.includes(food.id)
                                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
                                    : "border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
                                }`}
                                onClick={() => {
                                    if (selectedIds.includes(food.id)) {
                                        setSelectedIds(prev => prev.filter(id => id !== food.id));
                                    } else {
                                        setSelectedIds(prev => [...prev, food.id]);
                                    }
                                }}
                            >
                                {selectedIds.includes(food.id) ? "✓ Đã chọn" : "Chọn món này"}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )
        })}
      </div>

      {/* Confirm Selection Button */}
      {selectedIds.length > 0 && (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 left-0 right-0 px-4 z-50 flex justify-center"
        >
            <div className="bg-white p-2 rounded-2xl shadow-xl border border-indigo-100 w-full max-w-md flex items-center justify-between pl-4">
                <span className="text-sm font-semibold text-gray-700">Đã chọn {selectedIds.length} món</span>
                <Button 
                    onClick={() => {
                        if (confirm(`Xác nhận lưu ${selectedIds.length} món vào lịch sử?`)) {
                            saveSmartSelection(selectedIds);
                        }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200"
                >
                    Lưu vào lịch sử
                </Button>
            </div>
        </motion.div>
      )}
    </div>
  );
}
