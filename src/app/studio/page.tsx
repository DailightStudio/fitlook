import HiggsfieldStudio from '@/components/products/HiggsfieldStudio';

export const metadata = { title: 'AI 쇼케이스 스튜디오 | fitlook' };

export default function StudioPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-ink">AI 쇼케이스 스튜디오</h1>
          <p className="text-lg text-ink/70">
            상품 이미지를 힉스필드 AI로 착장 영상으로 (베타/목업)
          </p>
        </div>

        <HiggsfieldStudio />
      </div>
    </div>
  );
}
