import { OutfitBuilder } from '@/components/outfits/OutfitBuilder';

export const metadata = { title: '코디 만들기 | fitlook' };

export default function NewOutfitPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 페이지 헤더 */}
      <div className="border-b border-primary/10 px-4 py-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-ink mb-2">나만의 코디 만들기</h1>
          <p className="text-ink/60">
            왼쪽에서 상품을 선택하고 오른쪽 슬롯에 추가하면 나만의 완벽한 코디가 완성됩니다.
          </p>
        </div>
      </div>

      {/* 빌더 영역 */}
      <OutfitBuilder />
    </div>
  );
}
