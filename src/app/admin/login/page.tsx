import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createAdminToken } from '@/lib/auth/admin';
import { ADMIN_COOKIE } from '@/lib/auth/session';

async function adminLogin(formData: FormData) {
  'use server';
  const password = String(formData.get('password') ?? '');
  const secret = process.env.ADMIN_SECRET ?? '';
  if (password && password === secret) {
    const token = await createAdminToken();
    const jar = await cookies();
    jar.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 12,
      path: '/',
    });
    redirect('/admin');
  }
  redirect('/admin/login?error=1');
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl border p-8 w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center">fitlook Admin</h1>
        {error && (
          <p className="text-sm text-red-600 text-center">비밀번호가 올바르지 않습니다</p>
        )}
        <form action={adminLogin} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              관리자 비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-gray-800 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
