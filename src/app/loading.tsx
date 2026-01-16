import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 space-y-4 text-orange-600">
      <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
      <p className="font-semibold animate-pulse">Đang tải...</p>
    </div>
  );
}
