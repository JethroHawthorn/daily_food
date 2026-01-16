import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 gap-8">
      <h1 className="text-4xl font-bold mb-4 text-center">Món Ngon Mỗi Ngày</h1>
      
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link href="/random" className="w-full">
          <Button className="w-full text-xl py-8 h-auto font-bold bg-orange-500 hover:bg-orange-600">
            🎲 Random Món Hôm Nay
          </Button>
        </Link>
        
        <Link href="/foods" className="w-full">
          <Button variant="outline" className="w-full text-xl py-6 h-auto font-semibold">
            🗂️ Quản Lý Món Ăn
          </Button>
        </Link>
      </div>
    </main>
  );
}
