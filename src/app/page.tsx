import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, CalendarClock, ChefHat } from 'lucide-react';

export default function Home() {
  return (
    <main className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center max-w-md">
      {/* Hero Section */}
      <div className="text-center mb-10 space-y-2 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <div className="bg-orange-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
           <span className="text-5xl">🍳</span>
        </div>
        <h1 className="text-4xl font-extrabold text-orange-950 tracking-tight">Hôm nay ăn gì?</h1>
        <p className="text-orange-800/60 font-medium">Để "Food Daily" chọn giúp bạn nhé!</p>
      </div>

      {/* Action Cards */}
      <div className="w-full space-y-4 grid gap-4">
        {/* Random Card */}
        <Link href="/random" className="w-full group">
          <Button 
            className="w-full h-auto py-6 text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-200 border-none transition-all active:scale-95 flex flex-col gap-1 items-center rounded-2xl"
          >
            <div className="flex items-center gap-3">
              <ChefHat className="w-8 h-8" />
              <span>QUAY NGAY</span>
            </div>
            <span className="text-xs font-normal opacity-90 text-white/80">Tìm món ngẫu nhiên & quy tắc</span>
          </Button>
        </Link>
        
        {/* Manage Foods Card */}
        <Link href="/foods" className="w-full">
          <Button 
            variant="outline" 
            className="w-full h-auto py-5 text-lg font-bold border-2 border-orange-200 bg-white hover:bg-orange-50 text-orange-900 shadow-sm transition-all active:scale-95 flex items-center gap-3 justify-center rounded-2xl"
          >
            <UtensilsCrossed className="w-5 h-5 text-orange-500" />
            Quản Lý Món Ăn
          </Button>
        </Link>
        
        {/* History Card */}
        <Link href="/history" className="w-full">
          <Button 
            variant="ghost" 
            className="w-full h-auto py-4 text-base font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 hover:text-orange-800 border border-dashed border-orange-200 rounded-2xl flex items-center gap-2 justify-center transition-all active:scale-95"
          >
            <CalendarClock className="w-5 h-5 text-orange-500" />
            Xem lịch sử ăn uống
          </Button>
        </Link>
      </div>

      <footer className="mt-12 text-center text-xs text-gray-400">
        <p>© 2026 Món Ngon Mỗi Ngày</p>
      </footer>
    </main>
  );
}
