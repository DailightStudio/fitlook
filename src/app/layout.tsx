import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import './globals.css';

const notoSans = Noto_Sans_KR({
  subsets: ['latin'],
  weight: 'variable',
  variable: '--font-noto',
});

export const metadata: Metadata = {
  title: 'fitlook — 3D 코디 미리보기',
  description: '실제 상품으로 3D 코디를 미리보고 회전해보세요',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={notoSans.variable}>
      <body className="font-sans text-ink bg-surface">
        <Header />
        {children}
      </body>
    </html>
  );
}
