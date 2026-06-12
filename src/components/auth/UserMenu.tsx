'use client';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  name?: string | null;
  avatarUrl?: string | null;
  provider: string;
  email?: string | null;
}

export function UserMenu() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  if (user === undefined) return null;

  if (!user || user.provider === 'guest') {
    return (
      <div className="flex items-center gap-2">
        <a
          href="/api/auth/login/kakao"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FEE500] text-[#3C1E1E] text-xs font-semibold rounded-lg hover:opacity-90 transition"
        >
          카카오 로그인
        </a>
        {process.env.NEXT_PUBLIC_GOOGLE_ENABLED === 'true' && (
          <a
            href="/api/auth/login/google"
            className="flex items-center gap-1.5 px-3 py-1.5 border text-xs font-semibold rounded-lg hover:bg-gray-50 transition"
          >
            Google 로그인
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {user.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatarUrl} alt={user.name ?? '프로필'} className="w-7 h-7 rounded-full object-cover" />
      ) : (
        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
          {(user.name ?? '?')[0]}
        </div>
      )}
      <span className="text-sm text-gray-700">{user.name ?? '사용자'}</span>
      <form action="/api/auth/logout" method="post">
        <button type="submit" className="text-xs text-gray-400 hover:text-gray-700 transition">
          로그아웃
        </button>
      </form>
    </div>
  );
}
