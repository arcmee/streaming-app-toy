# Project Structure

- root
  - `apps/` — App targets
    - `web/` — Next.js 웹 클라이언트 (`app/` 라우트 기반, Turbopack dev)
      - `app/` — 기능별 폴더(`channel`, `vod`, `login`, `signup`, `me`, `presentation`, `application`, `domain`, `infrastructure`, `fonts`)와 전역 레이아웃 (`layout.tsx`, `globals.css`)
    - `mobile/` — Next.js 기반 RN-shell 웹 프리뷰 (웹과 동일한 라우트 구조)
      - `app/` — `channel`, `vod`, `login`, `signup`, `presentation` 등 웹과 동일한 구조
  - `packages/` — 공유 패키지
    - `logic/` — 비즈니스/네트워크 로직
      - `src/api/` — API 클라이언트, 도메인별 API(`chat`, `stream`, `auth` 등)
      - `src/auth/` — 토큰 스토리지 등 인증 유틸
      - `src/context/` — 전역 컨텍스트(`auth-context`)
      - `src/domain/` — 도메인 타입 정의
      - `api-client.ts`, `index.ts` — axios 설정, 패키지 엔트리
    - `ui/` — 공유 UI 컴포넌트/레이아웃
      - `src/chat.tsx`, `button.tsx`, `card.tsx`, `layout.tsx`, `header.tsx`, `lib/color.ts` 등
    - `eslint-config/`, `typescript-config/` — ESLint/TS 설정 패키지
  - `package.json`, `turbo.json`, `playwright.config.ts` — 루트 설정
  - `.env.example`, `.env.local` — 환경 변수 예시/로컬 설정
  - `tests/`, `test-results/`, `server-info/` — 테스트/서버 메타 자료

## 주요 경로
- 스트리밍 뷰어 & 채팅: `apps/web/app/channel/[userId]/page.tsx`, `apps/mobile/app/channel/[userId]/page.tsx`
- 스트리밍 로직: `packages/logic/src/api/stream.ts`, `packages/logic/src/api/chat.ts`
- UI 공용 채팅 컴포넌트: `packages/ui/src/chat.tsx`

## 빌드/개발 스크립트
- 전체 dev: `npm run dev` (turbo)
- 웹만 dev: `npx turbo run dev --filter=web`
- 모바일만 dev: `npx turbo run dev --filter=mobile`
- 빌드: `npm run build`
- 린트: `npm run lint`
- 타입 체크: `npm run check-types`
