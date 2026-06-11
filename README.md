# fitlook — 3D 패션 코디 앱

실제 상품으로 3D 코디를 미리보고 회전해보는 패션 앱.

## 기술 스택

- **Frontend:** Next.js 16 + React 19 + Tailwind v4
- **3D Engine:** Unity WebGL (임베드 예정)
- **Database:** Supabase
- **상품 데이터:** 실제 쇼핑몰 API 연동

## 핵심 기능

1. **코디 조합** — 웹에서 실제 상품을 선택해 코디 조합
2. **3D 미리보기** — Unity WebGL로 360도 회전
3. **공유 & 구매** — 완성된 코디 공유 및 한 번에 구매

## 디렉토리 구조

```
fitlook/
├── src/
│   ├── app/          # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/   # React 컴포넌트
│   ├── lib/         # 유틸리티
│   └── types/       # TypeScript 타입
├── public/          # 정적 파일 & Unity WebGL 빌드 (예정)
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## 설치 & 실행

```bash
npm install
npm run dev
# http://localhost:3000
```

## 블로커 & TODO

- [ ] Unity 3D 모델 & 웹글 빌드 설정
- [ ] Supabase 데이터베이스 스키마 설계 (상품, 코디, 사용자)
- [ ] 실제 상품 API 연동 (쇼핑몰 데이터)
- [ ] 3D 캐릭터 모델 & 의류 피팅
- [ ] 코디 공유 및 커머스 흐름
