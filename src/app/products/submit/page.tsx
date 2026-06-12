import SubmitProductForm from '@/components/products/SubmitProductForm';

export const metadata = { title: '3D 모델 생성 | fitlook' };

export default function SubmitProductPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-ink">상품 3D 모델 생성</h1>
          <p className="text-lg text-ink/70">
            쇼핑몰 링크를 입력하면 자동으로 3D 모델을 생성합니다
          </p>
        </div>

        <SubmitProductForm />
      </div>
    </div>
  );
}
