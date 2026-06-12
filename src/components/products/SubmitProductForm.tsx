'use client';

import { useState } from 'react';
import { ModelViewer } from './ModelViewer';

interface SubmissionState {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  modelUrl?: string;
  imageUrl?: string;
  productName?: string;
}

export default function SubmitProductForm() {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<SubmissionState>({ status: 'idle' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setState({ status: 'error', message: 'URL을 입력하세요' });
      return;
    }

    try {
      // Validate URL
      new URL(url);
    } catch {
      setState({ status: 'error', message: '올바른 URL을 입력하세요' });
      return;
    }

    setState({ status: 'loading', message: '3D 모델 생성 중...' });

    try {
      const response = await fetch('/api/products/generate-from-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '생성 실패');
      }

      const data = await response.json();

      setState({
        status: 'success',
        message: '✓ 3D 모델 생성 완료!',
        modelUrl: data.modelUrl,
        imageUrl: data.imageUrl,
        productName: data.productName,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '오류가 발생했습니다';
      setState({ status: 'error', message });
    }
  };

  return (
    <div className="space-y-6">
      {/* 입력 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-semibold text-ink mb-2">
            쇼핑몰 링크 <span className="text-primary">*</span>
          </label>
          <input
            id="url"
            type="url"
            placeholder="https://musinsa.com/products/123..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={state.status === 'loading'}
            className="w-full px-4 py-3 border border-primary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <p className="mt-2 text-xs text-ink/70">
            무신사, 쿠팡, G마켓 등 주요 쇼핑몰 링크 지원
          </p>
        </div>

        <button
          type="submit"
          disabled={state.status === 'loading'}
          className="w-full py-3 bg-gradient-to-r from-primary to-accent-deep hover:shadow-lg text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-wait"
        >
          {state.status === 'loading' ? '생성 중... (10초 이상 소요)' : '3D 모델 생성'}
        </button>
      </form>

      {/* 상태 메시지 */}
      {state.message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium ${
            state.status === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : state.status === 'success'
                ? 'bg-mint-soft text-ink border border-mint'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}
        >
          {state.message}
        </div>
      )}

      {/* 3D 뷰어 */}
      {state.status === 'success' && state.modelUrl && (
        <div className="space-y-4 pt-6 border-t border-surface">
          <div>
            <h2 className="text-lg font-semibold text-ink mb-2">
              {state.productName || '생성된 모델'}
            </h2>
            <p className="text-sm text-ink/70 mb-4">
              마우스로 드래그하여 회전, 스크롤로 줌 가능
            </p>
          </div>

          <ModelViewer modelUrl={state.modelUrl} productName={state.productName || '모델'} />

          {state.imageUrl && (
            <div>
              <p className="text-xs text-ink/70 mb-2">원본 이미지</p>
              <img
                src={state.imageUrl}
                alt="원본"
                className="w-full rounded-xl border border-surface"
                onError={() => console.log('Image load failed')}
              />
            </div>
          )}

          {/* 공유 버튼 */}
          <button
            onClick={() => {
              const text = `fitlook에서 생성한 3D 모델을 확인해보세요!\n${window.location.href}`;
              navigator.clipboard.writeText(text);
              alert('링크가 복사되었습니다!');
            }}
            className="w-full py-2 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition"
          >
            링크 공유하기
          </button>
        </div>
      )}
    </div>
  );
}
