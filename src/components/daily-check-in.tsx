'use client';

import { useState, useEffect } from 'react';
import { getCheckIn, saveCheckIn } from '@/actions/checkin';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, X } from 'lucide-react';

export default function DailyCheckIn() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    // 1. Check time: only after 18:00
    const now = new Date();
    const hour = now.getHours();
    
    // For demo/dev purposes, maybe we loose this restriction or keep it strict?
    // User asked "Trigger once per day after 18:00 (configurable)".
    // Let's stick to strict 18:00 for strictness, or maybe 17:00?
    // Let's use 18 as requested.
    if (hour < 18) return;

    // 2. Check if already checked in today
    const dateStr = now.toISOString().split('T')[0];
    const status = await getCheckIn(dateStr);
    
    if (!status) {
      setShow(true);
    }
  }

  async function handleCheckIn(status: 'FOLLOWED' | 'NOT_FOLLOWED') {
    setLoading(true);
    const dateStr = new Date().toISOString().split('T')[0];
    try {
      await saveCheckIn(dateStr, status);
      setShow(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-2xl shadow-2xl border-2 border-orange-100 p-5 z-50"
        >
          <div className="flex justify-between items-start mb-3">
             <div className="flex items-center gap-2">
                <div className="bg-orange-100 p-2 rounded-full">
                    <Utensils className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-bold text-gray-800">Check-in Hôm Nay</h3>
             </div>
             <button onClick={() => setShow(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
             </button>
          </div>
          
          <p className="text-gray-600 mb-4 text-sm font-medium">
            🍽️ Bạn đã ăn theo gợi ý hôm nay chưa?
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Button 
                disabled={loading}
                onClick={() => handleCheckIn('FOLLOWED')}
                className="bg-green-600 hover:bg-green-700 text-white font-bold"
            >
                ✅ Đã ăn
            </Button>
            <Button 
                disabled={loading}
                variant="outline"
                onClick={() => handleCheckIn('NOT_FOLLOWED')}
                className="border-orange-200 text-orange-700 hover:bg-orange-50 font-semibold"
            >
                🍕 Ăn món khác
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
