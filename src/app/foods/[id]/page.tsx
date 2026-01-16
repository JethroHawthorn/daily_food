import { getFood, updateFood } from "@/actions/food";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditFoodPage({ params }: { params: { id: string } }) {
  const food = await getFood(Number(params.id));
  
  if (!food) {
    notFound();
  }

  const updateFoodWithId = updateFood.bind(null, food.id);

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Sửa Món Ăn</h1>
      
      <form action={updateFoodWithId} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tên món</label>
          <Input name="name" required defaultValue={food.name} />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Loại</label>
          <select 
            name="type" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
            required
            defaultValue={food.type}
          >
            <option value="CHINH">Món Chính (Cơm, Phở...)</option>
            <option value="PHU">Món Phụ (Canh, Rau...)</option>
            <option value="AN_NHE">Ăn Nhẹ Sáng/Chiều</option>
            <option value="HOA_QUA">Hoa Quả / Tráng Miệng</option>
            <option value="AN_VAT">Ăn Vặt</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Tags</label>
          <Input name="tags" defaultValue={food.tags || ''} placeholder="Ví dụ: trung, thit" />
        </div>

        <div>
           <label className="block text-sm font-medium mb-1">Giá (VNĐ)</label>
          <Input name="price" type="number" defaultValue={food.price || ''} min="0" step="1000" />
        </div>
        
        <div className="pt-4 flex gap-4">
          <Button type="submit" className="flex-1">Lưu Thay Đổi</Button>
          <Link href="/foods" className="flex-1">
            <Button variant="outline" type="button" className="w-full">Hủy</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
