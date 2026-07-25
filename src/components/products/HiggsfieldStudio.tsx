'use client';

import { useEffect, useState } from 'react';

interface StudioState {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  videoUrl?: string;
  mock?: boolean;
}

type MotionPreset = 'orbit' | 'zoom' | 'pan';

const LOADING_MESSAGES = [
  { after: 0, message: '이미지 분석 중...' },
  { after: 4000, message: 'Higgsfield에 업로드 중...' },
  { after: 10000, message: 'AI 영상 생성 중... (수십 초 소요)' },
];

const MOTION_OPTIONS: { value: MotionPreset; label: string }[] = [
  { value: 'orbit', label: '360° 회전' },
  { value: 'zoom', label: '줌인' },
  { value: 'pan', label: '카메라 팬' },
];

export default function HiggsfieldStudio() {
  const [imageUrl, setImageUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [motion, setMotion] = useState<MotionPreset>('orbit');
  const [state, setState] = useState<StudioState>({ status: 'idle' });
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0].message);
  const [videoError, setVideoError] = useState(false);

  // 로딩 중 단계별 메시지 표시
  useEffect(() => {
    if (state.status !== 'loading') return;

    setLoadingMessage(LOADING_MESSAGES[0].message);
    const timers = LOADING_MESSAGES.slice(1).map(({ after, message }) =>
      setTimeout(() => setLoadingMessage(message), after)
    );

    return () => timers.forEach(clearTimeout);
  }, [state.status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageUrl.trim()) {
      setState({ status: 'error', message: '상품 이미지 URL을 입력하세요' });
      return;
    }

    try {
      // Validate URL
      new URL(imageUrl);
    } catch {
      setState({ status: 'error', message: '올바른 이미지 URL을 입력하세요' });
      return;
    }

    setState({ status: 'loading' });
    setVideoError(false);

    try {
      const response = await fetch('/api/higgsfield/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: imageUrl.trim(),
          prompt: prompt.trim() || undefined,
          motion,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || '생성 실패');
      }

      const data = await response.json();

      setState({
        status: 'success',
        message: '✓ AI 쇼케이스 영상 생성 완료!',
        videoUrl: data.videoUrl,
        mock: data.mock,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '오류가 발생했습니다';
      setState({ status: 'error', message });
    }
  };

  return (
    <div className="space-y-6">
      {/* 기능 안내: 3D가 아니라 AI 영상 생성임을 명시 */}
      <div className="p-4 rounded-xl text-sm text-ink/80 bg-primary-soft border border-primary/20">
        이 스튜디오는 3D 모델이 아닌{' '}
        <span className="font-semibold text-ink">AI 쇼케이스 영상</span>
        (모션/회전 영상)을 생성합니다. 3D 모델 생성은{' '}
        <span className="font-semibold text-ink">3D 생성</span> 메뉴를 이용하세요.
      </div>

      {/* 입력 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-semibold text-ink mb-2">
            상품 이미지 URL <span className="text-primary">*</span>
          </label>
          <input
            id="imageUrl"
            type="url"
            placeholder="https://cdn.example.com/product-image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={state.status === 'loading'}
            className="w-full px-4 py-3 border border-primary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="prompt" className="block text-sm font-semibold text-ink mb-2">
            프롬프트 (선택)
          </label>
          <input
            id="prompt"
            type="text"
            placeholder="모델이 천천히 회전하며 착장을 보여준다"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={state.status === 'loading'}
            className="w-full px-4 py-3 border border-primary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="motion" className="block text-sm font-semibold text-ink mb-2">
            모션 프리셋
          </label>
          <select
            id="motion"
            value={motion}
            onChange={(e) => setMotion(e.target.value as MotionPreset)}
            disabled={state.status === 'loading'}
            className="w-full px-4 py-3 border border-primary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            {MOTION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={state.status === 'loading'}
          className="w-full py-3 bg-gradient-to-r from-primary to-accent-deep hover:shadow-lg text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-wait"
        >
          {state.status === 'loading' ? '생성 중...' : 'AI 쇼케이스 영상 생성'}
        </button>
      </form>

      {/* 로딩 상태 (단계별 메시지) */}
      {state.status === 'loading' && (
        <div className="p-4 rounded-xl text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
          {loadingMessage}
        </div>
      )}

      {/* 상태 메시지 */}
      {state.message && state.status !== 'loading' && (
        <div
          className={`p-4 rounded-xl text-sm font-medium ${
            state.status === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-mint-soft text-ink border border-mint'
          }`}
        >
          {state.message}
        </div>
      )}

      {/* 영상 결과 */}
      {state.status === 'success' && state.videoUrl && (
        <div className="space-y-4 pt-6 border-t border-surface">
          {state.mock && (
            <div className="p-3 rounded-xl text-sm font-medium bg-lemon/20 border border-lemon text-ink">
              🧪 목업 샘플 영상입니다 (HIGGSFIELD_API_KEY 설정 시 실제 생성)
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-ink mb-2">AI 쇼케이스 영상</h2>
            <p className="text-sm text-ink/70 mb-4">
              재생/일시정지는 영상을 클릭하세요
            </p>
          </div>

          {videoError ? (
            <div className="p-4 rounded-xl text-sm font-medium bg-red-50 text-red-700 border border-red-200">
              영상을 불러오지 못했습니다
            </div>
          ) : (
            <video
              src={state.videoUrl}
              controls
              autoPlay
              loop
              muted
              playsInline
              className="w-full rounded-xl border border-surface"
              onError={() => {
                console.log('Video load failed');
                setVideoError(true);
              }}
            />
          )}

          <div>
            <p className="text-xs text-ink/70 mb-2">원본 이미지</p>
            <img
              src={imageUrl}
              alt="원본"
              className="w-full rounded-xl border border-surface"
              onError={() => console.log('Image load failed')}
            />
          </div>
        </div>
      )}
    </div>
  );
}
