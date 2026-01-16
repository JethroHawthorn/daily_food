import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 space-y-6 text-center">
      <div className="p-6 bg-orange-50 rounded-full animate-bounce">
        <SearchX className="w-16 h-16 text-orange-400" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold text-orange-950">404</h2>
        <h3 className="text-xl font-bold text-gray-700">Không tìm thấy trang</h3>
        <p className="text-gray-500 max-w-xs mx-auto">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
      </div>
      <Link href="/">
        <Button className="font-bold bg-orange-500 hover:bg-orange-600 border-none rounded-xl">
          🏠 Về Trang Chủ
        </Button>
      </Link>
    </div>
  );
}
