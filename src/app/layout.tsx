import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
