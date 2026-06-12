# fitlook — 3D 패션 코디 앱

실제 상품으로 3D 코디를 미리보고 회전해보는 패션 앱. 쇼핑몰 상품 URL을 제출하면 자동으로 3D 모델을 생성하고 아바타에 피팅합니다.

## 기술 스택

- **Frontend:** Next.js 16 + React 19 + Tailwind v4
- **3D Engine:** Unity 2022.3 LTS WebGL + glTFast
- **3D Generation:** Tripo.AI API (image-to-3d)
- **Database:** Neon PostgreSQL (Drizzle ORM)
- **배포:** Cloudflare Pages + Workers
- **호스팅:** fitlook.org (Custom Domain)

## 핵심 기능

1. **Virtual Try-On** — 쇼핑몰 상품 URL 제출 → 자동으로 3D 모델 생성 → 아바타에 피팅
2. **3D 미리보기** — Unity WebGL로 360도 회전, 드래그/스크롤 카메라 조작
3. **공유 & 구매** — 완성된 코디 공유 및 한 번에 구매 링크 제공

## 디렉토리 구조

```
fitlook/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API 라우트
│   │   │   └── products/
│   │   │       ├── generate-from-url/  # POST 엔드포인트: 이미지 추출 + Tripo 3D 생성
│   │   │       └── [id]/               # 상품 상세 페이지 (3D 뷰어 포함)
│   │   ├── products/
│   │   │   └── submit/    # 상품 제출 페이지
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── products/
│   │   │   ├── UnityViewer.tsx      # Unity WebGL 3D 뷰어
│   │   │   ├── ModelViewer.tsx      # Google Model Viewer (Fallback)
│   │   │   └── SubmitProductForm.tsx # 상품 URL 제출 폼
│   │   └── layout/
│   │       └── Header.tsx           # 네비게이션 (3D 생성 링크 포함)
│   ├── lib/
│   │   ├── tripo.ts        # Tripo.AI API 클라이언트
│   │   ├── crawl.ts        # 웹 크롤링 (상품 이미지 추출)
│   │   └── schema.ts       # Drizzle ORM 스키마
│   └── types/
├── unity/
│   └── fitlook-viewer/       # Unity 3D 뷰어 프로젝트
│       ├── Assets/
│       │   ├── Scripts/
│       │   │   ├── AvatarController.cs     # 아바타 애니메이션
│       │   │   ├── GarmentLoader.cs        # glTF/glb 로딩
│       │   │   ├── CameraController.cs     # 카메라 제어
│       │   │   └── TryOnManager.cs         # 조율 + JS 브릿지
│       │   ├── Plugins/
│       │   │   └── UnityWebGLBridge.jslib  # JS ↔ Unity 통신
│       │   ├── Scenes/
│       │   │   └── TryOn.unity  # 메인 씬 (아바타, 카메라, 조명)
│       │   └── Editor/
│       │       ├── SceneSetup.cs        # 씬 자동 생성 메뉴
│       │       └── WebGLBuilder.cs      # WebGL 빌드 자동화
│       ├── Packages/
│       │   └── manifest.json   # glTFast 6.0.0 의존성
│       └── ProjectSettings/
├── .open-next/
│   └── public/
│       └── unity-viewer/      # WebGL 빌드 출력 (배포 시)
│           └── Build/
│               ├── Build.data
│               ├── Build.framework.js
│               └── Build.wasm
├── spike/                    # 테스트 도구 & 스파이크
│   ├── samples.json          # 테스트 상품 URL 목록
│   ├── download-tripo-samples.ts  # Tripo 3D 모델 다운로드
│   ├── run-weight-transfer.ts     # Blender 자동 가중치 전달 (Phase 2)
│   └── assets/
│       └── rigged-figure.glb      # 테스트 아바타
├── drizzle/                  # 데이터베이스 마이그레이션
│   ├── 0003_add_model_3d_url.sql  # products 테이블에 model_3d_url 컬럼 추가
│   └── ...
├── scripts/
│   └── build-unity.ps1       # Unity WebGL 빌드 자동화 스크립트
├── public/          # 정적 파일 (Google Model Viewer 스크립트 등)
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## 설치 & 실행

### 1. Next.js 프론트엔드

```bash
npm install
npm run dev
# http://localhost:3000
```

### 2. Unity WebGL 뷰어 (선택사항)

```bash
# Unity 프로젝트 초기화
cd unity/fitlook-viewer
powershell -ExecutionPolicy Bypass -File ../../unity/setup-unity.ps1

# Unity Hub에서 프로젝트 추가 후, 에디터에서 Menu > fitlook > Setup > Create TryOn Scene 실행
# 또는 아래 스크립트로 자동 생성
```

### 3. WebGL 빌드 & 배포

```bash
npm run build:unity        # Unity WebGL 빌드 (5-10분 소요)
npm run build:cf           # Next.js 빌드
npm run deploy             # Cloudflare Pages 배포
```

## Virtual Try-On 워크플로우

### 사용자 관점

1. **상품 제출** — `/products/submit` 페이지에서 쇼핑몰 상품 URL 입력
   - 예: `https://www.musinsa.com/products/2900213`

2. **자동 처리** (백엔드)
   - 웹 크롤링으로 상품 이미지 추출 (`src/lib/crawl.ts`)
   - Tripo.AI API로 이미지를 3D 모델로 생성 (2-10초)
   - 생성된 GLB 모델 URL 저장

3. **3D 미리보기** — 상품 상세 페이지에서 Unity WebGL 뷰어로 표시
   - 마우스 드래그: 회전
   - 마우스 스크롤: 줌 인/아웃
   - 자동 폴백: 뷰어 로드 실패 시 Google Model Viewer 사용

### 기술 스택 통합

```
User Input (URL)
    ↓
POST /api/products/generate-from-url
    ↓
[Extract Image] → src/lib/crawl.ts
    ↓
[Generate 3D] → src/lib/tripo.ts (Tripo.AI API)
    ↓
[Save URL] → PostgreSQL (Neon)
    ↓
GET /products/[id]
    ↓
<UnityViewer modelUrl="..." />
    ↓
[Load WebGL] → unity-viewer/Build/
    ↓
[Render 3D] → Unity + glTFast (runtime model loading)
```

## 환경 변수

```bash
# .env.local
DATABASE_URL=postgresql://...              # Neon PostgreSQL
TRIPO_API_KEY=tsk_...                      # Tripo.AI API 키
APP_URL=http://localhost:3000              # 로컬 개발 주소
```

## 데이터베이스 스키마

### Products Table

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  model_3d_url TEXT,              -- 생성된 GLB 모델 URL
  source_url TEXT,                -- 원본 상품 URL
  price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

마이그레이션 실행:
```bash
npm run db:migrate
```

## 배포

### Cloudflare Pages (Next.js)

```bash
npm run deploy
# https://fitlook.pages.dev 또는 https://fitlook.org
```

### 특이사항

- **WebGL 빌드:** `.open-next/public/unity-viewer/Build/` 경로에 위치
- **Brotli 압축:** 100MB → 25MB 크기 감소
- **메모리:** 256MB (PlayerSettings에서 조정 가능)
- **CORS:** Tripo.AI, Google CDN은 이미 CORS 활성화

## 블로커 & TODO

- [x] Unity 3D 모델 & WebGL 빌드 설정 ✅
- [x] Virtual Try-On 워크플로우 구현 ✅
- [x] Web Crawler (이미지 추출) ✅
- [x] Tripo.AI 통합 ✅
- [ ] 데이터베이스 마이그레이션 수동 적용 (Neon 대시보드)
- [ ] 테스트 상품 생성 및 검증
- [ ] **Phase 2:** Blender 자동 가중치 전달 (cloth physics)
- [ ] **Phase 2:** 아바타 포즈 라이브러리 확장
- [ ] **Phase 2:** 모바일 AR 모드 (WebXR)
