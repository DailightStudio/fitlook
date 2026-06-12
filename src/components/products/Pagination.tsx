import Link from 'next/link';

export function Pagination({
  total,
  page,
  limit,
  basePath,
  search,
  category,
}: {
  total: number;
  page: number;
  limit: number;
  basePath: string;
  search?: string;
  category?: string;
}) {
  const totalPages = Math.ceil(total / limit);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    params.set('page', String(p));
    return `${basePath}?${params}`;
  };

  return (
    <div className="flex items-center justify-center gap-4 py-6">
      {hasPrev && (
        <Link href={buildHref(page - 1)} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
          이전
        </Link>
      )}
      <span className="text-sm text-gray-600">
        {page} / {totalPages}
      </span>
      {hasNext && (
        <Link href={buildHref(page + 1)} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
          다음
        </Link>
      )}
    </div>
  );
}
