'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { readDraft } from '@/lib/outfit-draft';
import { UserMenu } from '@/components/auth/UserMenu';

export function Header() {
  const [itemCount, setItemCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateCount = () => {
      const draft = readDraft();
      setItemCount(Object.keys(draft).length);
    };
    updateCount();
    window.addEventListener('fitlook:draft-changed', updateCount);
    window.addEventListener('storage', updateCount);
    return () => {
      window.removeEventListener('fitlook:draft-changed', updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const draftBadge = itemCount > 0 && (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent-deep text-white text-xs font-bold">
      {itemCount}
    </span>
  );

  return (
    <header
      className={`sticky top-0 z-50 transition-colors ${
        scrolled
          ? 'backdrop-blur-sm bg-surface/80 border-b border-primary/10'
          : 'bg-white border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
        >
          fitlook
        </Link>

        {/* 데스크톱 네비 */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/products" className="font-medium hover:text-primary transition">
            상품
          </Link>
          <Link href="/products/submit" className="font-medium text-accent hover:text-accent-deep transition">
            3D 생성
          </Link>
          <Link href="/outfits" className="font-medium hover:text-primary transition">
            코디 갤러리
          </Link>
          <Link
            href="/outfits/new"
            className="flex items-center gap-2 font-medium hover:text-primary transition"
          >
            코디 만들기
            {draftBadge}
          </Link>
          <UserMenu />
        </nav>

        {/* 모바일 햄버거 */}
        <button
          type="button"
          className="md:hidden flex flex-col justify-center items-center gap-1.5 w-10 h-10 rounded-lg hover:bg-primary-soft transition"
          aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span
            className={`block w-5 h-0.5 bg-ink rounded transition-transform ${
              menuOpen ? 'translate-y-2 rotate-45' : ''
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-ink rounded transition-opacity ${
              menuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-ink rounded transition-transform ${
              menuOpen ? '-translate-y-2 -rotate-45' : ''
            }`}
          />
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {menuOpen && (
        <nav id="mobile-menu" className="md:hidden border-t border-primary/10 bg-surface/95 backdrop-blur-sm px-4 py-3 flex flex-col gap-3 text-sm">
          <Link
            href="/products"
            className="font-medium hover:text-primary transition py-1"
            onClick={() => setMenuOpen(false)}
          >
            상품
          </Link>
          <Link
            href="/products/submit"
            className="font-medium text-accent hover:text-accent-deep transition py-1"
            onClick={() => setMenuOpen(false)}
          >
            3D 생성
          </Link>
          <Link
            href="/outfits"
            className="font-medium hover:text-primary transition py-1"
            onClick={() => setMenuOpen(false)}
          >
            코디 갤러리
          </Link>
          <Link
            href="/outfits/new"
            className="flex items-center gap-2 font-medium hover:text-primary transition py-1"
            onClick={() => setMenuOpen(false)}
          >
            코디 만들기
            {draftBadge}
          </Link>
          <UserMenu />
        </nav>
      )}
    </header>
  );
}
