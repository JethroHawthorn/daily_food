import { getFoods, deleteFood } from "@/actions/food";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Trash2, Edit } from "lucide-react";

export default async function FoodsPage() {
  const foods = await getFoods();

  return (
    <div className="container mx-auto p-4 max-w-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Danh sách món</h1>
        <Link href="/foods/create">
          <Button>+ Thêm món</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {foods.map((food) => (
          <div key={food.id} className="border p-4 rounded-lg shadow-sm flex justify-between items-center bg-white">
            <div>
              <h3 className="font-bold text-lg">{food.name}</h3>
              <div className="text-sm text-gray-500 flex gap-2">
                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{food.type}</span>
                {food.price ? <span className="text-green-600 font-medium">{food.price.toLocaleString()}đ</span> : null}
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/foods/${food.id}`}>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <form action={deleteFood.bind(null, food.id)}>
                <Button variant="destructive" size="sm" className="h-8 w-8 p-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        ))}
        
        {foods.length === 0 && (
          <p className="text-center text-gray-500 mt-8">Chưa có món ăn nào. Hãy thêm món mới!</p>
        )}
      </div>

      <div className="mt-8 text-center">
        <Link href="/">
          <Button variant="outline">🏠 Về Trang Chủ</Button>
        </Link>
      </div>
    </div>
  );
}
