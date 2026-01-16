'use client';

import { useState } from 'react';
import { analyzeFoodHabits } from '@/actions/ai';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnalysisComponent() {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  async function handleAnalyze() {
    setLoading(true);
    try {
      const result = await analyzeFoodHabits();
      setAnalysis(result);
      setShowModal(true);
    } catch (error) {
      console.error(error);
      alert('Có lỗi khi phân tích.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button 
        onClick={handleAnalyze} 
        disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 shadow-md rounded-xl w-full flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
        {loading ? 'Đang phân tích...' : 'Phân Tích Thói Quen'}
      </Button>

      <AnimatePresence>
        {showModal && analysis && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 flex justify-between items-center text-white">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Góc Nhìn AI
                </h3>
                <button onClick={() => setShowModal(false)} className="hover:bg-white/20 rounded-full p-1 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 text-gray-800 leading-relaxed text-sm md:text-base space-y-4 max-h-[70vh] overflow-y-auto">
                 {analysis.split('\n').map((paragraph, idx) => (
                    paragraph.trim() && <p key={idx}>{paragraph}</p>
                 ))}
              </div>

              <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
                <Button variant="outline" onClick={() => setShowModal(false)} className="rounded-xl">
                  Đóng
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
