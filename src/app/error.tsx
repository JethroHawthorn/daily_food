'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 space-y-6 text-center">
      <div className="p-4 bg-red-50 rounded-full">
        <AlertCircle className="w-12 h-12 text-red-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">Đã có lỗi xảy ra!</h2>
        <p className="text-gray-500 max-w-sm">
          Chúng tôi xin lỗi vì sự bất tiện này. Vui lòng thử lại sau.
        </p>
      </div>
      <Button
        onClick={() => reset()}
        variant="outline"
        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        Thử lại
      </Button>
    </div>
  );
}
