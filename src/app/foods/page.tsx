import { getFoods, deleteFood } from "@/actions/food";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FoodList } from "@/components/food-list";

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

      <FoodList initialFoods={foods} />

      <div className="mt-8 text-center">
        <Link href="/">
          <Button variant="outline">🏠 Về Trang Chủ</Button>
        </Link>
      </div>
    </div>
  );
}
