import Link from 'next/link';
import type { categories } from '@/lib/schema';

type Category = typeof categories.$inferSelect;

export function CategoryTabs({
  cats,
  current,
}: {
  cats: Category[];
  current?: string;
}) {
  return (
    <div className="flex gap-2 border-b overflow-x-auto">
      <Link
        href="/products"
        className={`px-4 py-3 whitespace-nowrap border-b-2 transition ${
          !current ? 'border-primary text-primary font-semibold' : 'border-transparent text-ink/70 hover:text-primary'
        }`}
      >
        전체
      </Link>
      {cats.map((cat) => (
        <Link
          key={cat.id}
          href={`/products?category=${cat.slug}`}
          className={`px-4 py-3 whitespace-nowrap border-b-2 transition ${
            current === cat.slug
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-ink/70 hover:text-primary'
          }`}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
