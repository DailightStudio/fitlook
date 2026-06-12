import { db } from '@/lib/db';
import { categories } from '@/lib/schema';
import ProductForm from '@/components/admin/ProductForm';

export default async function NewProductPage() {
  const categoryList = await db.select().from(categories).orderBy(categories.id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">상품 등록</h1>
      <ProductForm categories={categoryList} />
    </div>
  );
}
