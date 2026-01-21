
import { SmartMealSuggestion } from '@/components/smart-meal-suggestion';
import { getFoods } from '@/actions/food';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function SmartPage() {
  const foods = await getFoods();

  return (
    <main className="container mx-auto p-4 min-h-screen max-w-md">
      <div className="mb-6 flex items-center gap-2">
        <Link href="/">
          <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Gợi ý thông minh</h1>
      </div>
      
      <SmartMealSuggestion foods={foods} />
    </main>
  );
}
