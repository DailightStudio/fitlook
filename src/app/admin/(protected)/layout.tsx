import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/admin';

export const metadata = { title: 'fitlook Admin' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-8">
          <Link href="/admin" className="text-xl font-bold text-gray-800">
            fitlook Admin
          </Link>
          <nav className="flex gap-4 text-sm text-gray-600">
            <Link href="/admin/products" className="hover:text-gray-900">
              상품 목록
            </Link>
            <Link href="/admin/products/new" className="hover:text-gray-900">
              상품 등록
            </Link>
          </nav>
          <form action="/api/auth/admin-logout" method="post" className="ml-auto">
            <button type="submit" className="text-sm text-gray-500 hover:text-gray-800">
              로그아웃
            </button>
          </form>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
