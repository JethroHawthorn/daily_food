'use client';

import { login } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { ChefHat } from 'lucide-react';
import { useActionState } from 'react';

export default function WelcomePage() {
  const [state, formAction, isPending] = useActionState(async (state: null, formData: FormData) => {
      await login(formData);
      return null;
  }, null);

  return (
    <main className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center max-w-md bg-orange-50/30">
      <div className="w-full text-center space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <div className="bg-orange-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md shadow-orange-100">
           <span className="text-6xl">🍳</span>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-orange-950 tracking-tight">Xin chào!</h1>
          <p className="text-orange-800/60 font-medium">Nhập số điện thoại để bắt đầu</p>
        </div>

        <form action={formAction} className="w-full space-y-4 mt-8 px-4">
          <div className="relative">
            <input
              name="phone"
              type="tel"
              placeholder="Số điện thoại của bạn"
              required
              pattern="[0-9]{9,12}"
              className="w-full px-6 py-4 rounded-2xl border-2 border-orange-100 bg-white text-lg focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all text-center placeholder:text-gray-300 text-orange-900 font-bold tracking-widest"
              autoFocus
            />
          </div>
          
          <Button 
            disabled={isPending}
            className="w-full py-7 text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-xl shadow-orange-200 border-none transition-all active:scale-95 flex items-center justify-center gap-3 rounded-2xl"
          >
            {isPending ? (
              <span className="animate-pulse">Đang xử lý...</span>
            ) : (
              <>
                <span>BẮT ĐẦU NGAY</span>
                <ChefHat className="w-6 h-6" />
              </>
            )}
          </Button>
          <p className="text-xs text-gray-400 mt-4">
            Dữ liệu của bạn sẽ được lưu riêng biệt theo số điện thoại này.
          </p>
        </form>
      </div>
    </main>
  );
}
