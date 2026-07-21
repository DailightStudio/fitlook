# fitlook Virtual Try-On — START HERE 🚀

**상태:** ✅ 완전 구현 완료 (2026-06-12)

모든 Virtual Try-On 3D 시스템이 완성되었습니다. 아래 단계대로 따라하세요.

---

## 1️⃣ 한 줄 명령 (권장)

```bash
npm run setup:complete
```

이 명령은 다음을 자동으로 수행합니다:
- ✅ npm 의존성 설치
- ✅ 데이터베이스 마이그레이션 (자동)
- ✅ Unity WebGL 빌드 (5-10분)
- ✅ Next.js 빌드
- ✅ Cloudflare Pages 배포

---

## 2️⃣ 단계별 실행 (수동 제어)

### Step 1: 로컬 테스트

```bash
npm install
npm run dev
```

- http://localhost:3000 접속
- `/products/submit` 페이지에서 상품 URL 입력
- 3D 모델 자동 생성 확인

### Step 2: 데이터베이스 마이그레이션

```bash
npm run db:migrate:auto
```

또는 수동:
1. https://console.neon.tech 접속
2. SQL Editor
3. `drizzle/0003_add_model_3d_url.sql` 파일 내용 복사/붙여넣기
4. 실행

### Step 3: Unity WebGL 빌드 (필요시)

```bash
npm run build:unity
```

또는 Unity 에디터에서:
1. 열기: `unity/fitlook-viewer/`
2. Menu > `fitlook > Setup > Create TryOn Scene`
3. Menu > `fitlook > Setup > Configure Build Settings`
4. Build 메뉴에서 WebGL 빌드

### Step 4: 배포

```bash
npm run deploy
```

또는 별도로:
```bash
npm run build:cf              # Next.js 빌드
wrangler pages deploy         # Cloudflare 배포
```

---

## 📊 검증 체크리스트

### 로컬 확인
- [ ] `npm run dev` 실행됨
- [ ] http://localhost:3000/products/submit 접속 가능
- [ ] URL 입력 후 3D 모델 생성 성공 (2-10초)
- [ ] 3D 뷰어 로드됨 (마우스 드래그로 회전 가능)

### 데이터베이스 확인
- [ ] `npm run db:migrate:auto` 성공 또는 수동 마이그레이션 완료
- [ ] products 테이블에 model_3d_url 컬럼 존재 (Neon 대시보드에서 확인)

### 배포 확인
- [ ] `npm run deploy` 성공
- [ ] https://fitlook.org 또는 https://fitlook.pages.dev 접속 가능
- [ ] 프로덕션 환경에서 3D 생성 작동 확인

---

## 🔧 문제 해결

### "TRIPO_API_KEY is not set"

`.env.local` 파일 확인:
```bash
TRIPO_API_KEY=tsk_k7CaKGWvvweAoN-O-kEWs1XsO3LxzKxXUjIvf2ZNsCd
DATABASE_URL=postgresql://...
APP_URL=http://localhost:3000
```

### "3D 모델 생성에 실패했습니다"

가능한 원인:
1. 상품 URL이 유효하지 않음 (이미지 미포함 사이트)
2. Tripo.AI API 키 무효
3. 네트워크 타임아웃

→ 로그 확인: 브라우저 F12 → Console 탭

### "WebGL 뷰어 로드 오류"

1. `.open-next/public/unity-viewer/Build/` 디렉토리 존재 확인
2. `npm run build:unity` 다시 실행
3. 브라우저 캐시 삭제 후 새로고침

### "Database migration failed"

수동 마이그레이션 필요:
```sql
-- Neon dashboard SQL Editor에서 실행:
ALTER TABLE products ADD COLUMN model_3d_url text;
```

---

## 📚 상세 문서

- **전체 설명:** `VIRTUAL-TRYON-SETUP.md`
- **빠른 참고:** `QUICK-START.md`
- **프로젝트 문서:** `README.md`
- **Unity 가이드:** `unity/fitlook-viewer/README.md`

---

## 🎯 파이프라인 확인

```
사용자 입력 (상품 URL)
    ↓
POST /api/products/generate-from-url
    ↓
[이미지 추출] + [Tripo.AI 3D 생성]
    ↓
[GLB URL 저장] (PostgreSQL)
    ↓
GET /products/[id]
    ↓
<UnityViewer modelUrl="..." />
    ↓
[WebGL 렌더링] (Unity 2022.3)
    ↓
[3D 모델 표시] (마우스 상호작용 가능)
```

---

## 🚀 다음 단계

1. ✅ 위 체크리스트 완료
2. ⏭️ **Phase 2 (향후):**
   - Cloth Physics (Blender 자동 가중치 전달)
   - 아바타 커스터마이징 (체형, 피부톤)
   - 모바일 AR (WebXR)

---

## 💬 핵심 명령어 정리

```bash
# 개발
npm run dev                  # 로컬 서버

# 데이터베이스
npm run db:migrate:auto      # 자동 마이그레이션
npm run db:studio           # Drizzle Studio

# 테스트
npm run spike:download      # 테스트 3D 모델 다운로드

# 빌드
npm run build:unity         # WebGL 빌드
npm run build:cf            # Next.js + OpenNext 빌드

# 배포
npm run deploy              # 전체 배포 (권장)
npm run setup:complete      # 완벽 자동화 설정

# 개별 실행
npm run preview:cf          # Cloudflare 로컬 프리뷰
```

---

**준비 완료! 위의 명령을 실행하고 fitlook을 배포하세요.** 🎉

문제가 발생하면 상세 문서를 참고하세요.
