'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit, Search } from 'lucide-react';
import { deleteFood, Food } from '@/actions/food';
import { getFoodIcon } from '@/lib/utils';

export function FoodList({ initialFoods }: { initialFoods: Food[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'CHINH' | 'PHU' | 'OTHER'>('ALL');

  const filteredFoods = initialFoods.filter(food => {
    // Filter by Tab
    if (activeTab === 'CHINH' && food.type !== 'CHINH') return false;
    if (activeTab === 'PHU' && food.type !== 'PHU') return false;
    if (activeTab === 'OTHER' && (food.type === 'CHINH' || food.type === 'PHU')) return false;

    // Filter by Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      return (
        food.name.toLowerCase().includes(lowerTerm) || 
        food.tags?.toLowerCase().includes(lowerTerm)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="bg-white p-3 rounded-xl shadow-sm space-y-3 sticky top-2 z-10 border border-orange-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
          <Input 
            placeholder="Tìm theo tên, tag..." 
            className="pl-9 bg-orange-50/50 border-orange-200 focus-visible:ring-orange-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
           <Button 
             size="sm" 
             variant={activeTab === 'ALL' ? 'default' : 'ghost'} 
             onClick={() => setActiveTab('ALL')}
             className="rounded-full px-4"
           >
             Tất cả
           </Button>
           <Button 
             size="sm" 
             variant={activeTab === 'CHINH' ? 'default' : 'ghost'} 
             onClick={() => setActiveTab('CHINH')}
             className="rounded-full px-4"
           >
             Món Chính
           </Button>
           <Button 
             size="sm" 
             variant={activeTab === 'PHU' ? 'default' : 'ghost'} 
             onClick={() => setActiveTab('PHU')}
             className="rounded-full px-4"
           >
             Món Phụ
           </Button>
           <Button 
             size="sm" 
             variant={activeTab === 'OTHER' ? 'default' : 'ghost'} 
             onClick={() => setActiveTab('OTHER')}
             className="rounded-full px-4"
           >
             Khác
           </Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3 min-h-[300px]">
        {filteredFoods.map((food) => (
          <div key={food.id} className="group border border-orange-100 p-4 rounded-xl shadow-sm flex justify-between items-center bg-white hover:shadow-md hover:border-orange-300 transition-all">
            <div className="flex-1 min-w-0 pr-2">
              <h3 className="font-bold text-lg text-orange-950 truncate flex items-center gap-2">
                <span className="text-2xl">{getFoodIcon(food.name, food.type)}</span>
                {food.name}
              </h3>
              <div className="text-sm text-gray-500 flex flex-wrap gap-2 items-center mt-1">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  food.type === 'CHINH' ? 'bg-orange-100 text-orange-700' : 
                  food.type === 'PHU' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {food.type}
                </span>
                {food.price && <span className="text-green-600 font-bold">{food.price.toLocaleString()}đ</span>}
                {food.tags && food.tags.split(',').map((tag, i) => (
                  <span key={i} className="text-xs bg-gray-50 text-gray-400 px-1 rounded border">#{tag.trim()}</span>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <Link href={`/foods/${food.id}`}>
                <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-full border-orange-200 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <form action={async () => {
                if(confirm('Xoá món này?')) await deleteFood(food.id);
              }}>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full text-red-400 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        ))}
        
        {filteredFoods.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-400 mb-4">Không tìm thấy món nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}
