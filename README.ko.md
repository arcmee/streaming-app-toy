# Streaming App

모노레포 기반의 스트리밍 클라이언트 프로젝트입니다. `web`과 `mobile` 두 개의 Next.js 앱이 공용 UI와 비즈니스 로직 패키지를 공유하며, 라이브 스트리밍 조회, 채널 시청, 실시간 채팅, 인증, VOD 조회/업로드 흐름을 제공합니다.

영문 문서는 [README.md](./README.md)에서 확인할 수 있습니다.

## 프로젝트 개요

이 저장소는 Turborepo 워크스페이스로 구성되어 있으며, 프론트엔드 클라이언트를 여러 앱으로 분리하고 공용 로직은 `packages/*`에 모아 재사용합니다.

현재 코드 기준으로 다음 흐름이 구현되어 있습니다.

- 라이브 스트림 목록 조회
- 회원가입, 로그인, 로그아웃
- JWT 기반 인증 상태 유지 및 토큰 재발급 처리
- 채널 상세 화면에서 HLS 라이브 재생
- Socket.IO 기반 실시간 채팅
- 채널별 VOD 목록 조회
- VOD 상세 재생
- 인증 사용자용 VOD 업로드
- 내 채널 조회 및 스트림 키/RTMP 서버 주소 확인

## 기술 스택

### 공통/모노레포

- `Turborepo`로 워크스페이스 빌드/실행 오케스트레이션
- `npm workspaces`로 앱/패키지 관리
- `TypeScript` 기반 전체 코드 작성
- `ESLint` + `Prettier`로 정적 검사 및 포맷팅

### 앱 레이어

- `Next.js 15`
- `React 19`
- App Router 기반 라우팅
- `next/font/local`로 로컬 폰트 로딩

### 데이터/통신

- `axios` 기반 REST API 클라이언트
- `socket.io-client` 기반 실시간 채팅 연결
- `jwt-decode`로 클라이언트 측 토큰 디코딩

### 미디어

- `hls.js`로 라이브 HLS 재생
- `react-player`로 VOD 재생

### 테스트

- `Playwright` 기반 E2E 스모크 테스트

## 저장소 구조

```text
.
|-- apps
|   |-- web               # 데스크톱/웹 클라이언트 (Next.js, 3000)
|   `-- mobile            # 모바일용 별도 클라이언트 (Next.js, 3001)
|-- packages
|   |-- logic             # API 호출, 인증, 도메인 타입, 소켓/컨텍스트
|   |-- ui                # 공용 UI 컴포넌트
|   |-- eslint-config     # 공용 ESLint 설정
|   `-- typescript-config # 공용 TypeScript 설정
|-- tests
|   `-- e2e               # Playwright 스모크 테스트
|-- turbo.json            # Turborepo 파이프라인 정의
`-- package.json          # 루트 스크립트 및 워크스페이스 설정
```

## 워크스페이스 상세

### `apps/web`

기본 웹 클라이언트입니다. 주요 라우트는 아래와 같습니다.

- `/` : 라이브 스트림 목록
- `/login` : 로그인
- `/signup` : 회원가입
- `/me` : 내 계정/내 채널/스트림 키 확인
- `/channel/[userId]` : 채널 상세, 라이브 플레이어, 채팅
- `/channel/[userId]/vods` : 채널별 VOD 목록
- `/vod/[vodId]` : VOD 상세 재생
- `/vod/upload` : VOD 업로드

### `apps/mobile`

이름은 `mobile`이지만 현재는 React Native 앱이 아니라 `Next.js` 기반 별도 클라이언트입니다. 포트만 다르고, 대부분의 기능 흐름은 `web`과 유사합니다.

- 기본 개발 포트: `3001`
- 공용 로직: `@repo/logic`
- 공용 UI: `@repo/ui`

### `packages/logic`

앱 간 공유되는 비즈니스 로직 패키지입니다.

- `src/api-client.ts`
  REST API용 `axios` 인스턴스
- `src/api/auth.ts`
  회원가입, 로그인, 로그아웃, 토큰 갱신
- `src/api/stream.ts`
  스트림/채널/VOD 조회와 업로드
- `src/api/chat.ts`
  Socket.IO 연결, 방 입장/퇴장, 메시지 송수신
- `src/context/auth-context.tsx`
  인증 상태 관리
- `src/auth/token-storage.ts`
  브라우저 `localStorage` 기반 토큰 저장
- `src/domain/*`
  스트림, 채널, 사용자, 인증, 채팅, VOD 타입 정의

### `packages/ui`

앱에서 공유하는 프레젠테이션 컴포넌트 패키지입니다.

- `Card`
- `Button`
- `Input`
- `Label`
- `Layout`
- `Chat`

## 실행 방법

### 요구 사항

- Node.js `18` 이상
- npm `11` 이상 권장
- 연결할 백엔드/소켓/스트리밍 서버

### 설치

```bash
npm install
```

### 전체 개발 서버 실행

```bash
npm run dev
```

### 특정 앱만 실행

```bash
npx turbo run dev --filter=web
npx turbo run dev --filter=mobile
```

기본 포트:

- `web`: `http://localhost:3000`
- `mobile`: `http://localhost:3001`

### 빌드

```bash
npm run build
```

### 린트

```bash
npm run lint
```

### 타입 체크

```bash
npm run check-types
```

### 포맷팅

```bash
npm run format
```

## 환경 변수

코드 기준으로 다음 환경 변수를 사용합니다.

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:4000
NEXT_PUBLIC_STREAMING_SERVER_URL=http://localhost:<media-port>
```

설명:

- `NEXT_PUBLIC_API_URL`
  REST API 서버 주소. 기본값은 `http://localhost:4000`
- `NEXT_PUBLIC_SOCKET_SERVER_URL`
  채팅용 Socket.IO 서버 주소. 기본값은 `http://localhost:4000`
- `NEXT_PUBLIC_STREAMING_SERVER_URL`
  HLS 재생 URL 및 RTMP 유입 주소 계산에 사용되는 스트리밍 서버 주소

예를 들어 채널 페이지에서는 아래와 같은 HLS 주소를 조합해 사용합니다.

```text
{NEXT_PUBLIC_STREAMING_SERVER_URL}/live/{streamKey}.m3u8
```

`/me` 페이지에서는 `NEXT_PUBLIC_STREAMING_SERVER_URL`을 기준으로 OBS용 RTMP ingest 주소를 계산해 보여줍니다.

## 인증 구조

인증 처리는 `packages/logic` 안에 모여 있습니다.

- 로그인/회원가입 성공 시 access token과 refresh token을 저장
- `AuthProvider`가 앱 루트에서 현재 사용자 상태를 복원
- API 요청 시 `Authorization: Bearer <token>` 자동 첨부
- `401` 응답 시 refresh token으로 1회 재발급 시도
- 로그아웃 시 서버 로그아웃 호출 후 로컬 토큰 제거

토큰 저장소는 브라우저 환경에서는 `localStorage`, 그 외 환경에서는 메모리 fallback을 사용합니다.

## 스트리밍/채팅 구조

### 라이브 재생

- 채널 페이지에서 사용자 ID로 채널 정보를 조회
- 스트림 키 또는 스트림 ID를 기반으로 HLS URL 생성
- 브라우저가 HLS 네이티브 재생을 지원하면 `<video>`로 직접 재생
- 미지원 브라우저는 `hls.js`를 동적으로 로드해서 재생

### 실시간 채팅

- 인증 토큰으로 Socket.IO 연결 생성
- 스트림 ID 단위 방 입장/퇴장
- 새 메시지, 입장, 퇴장 이벤트 수신
- 토큰 변경 시 소켓 인증 정보 갱신 후 재연결
- 재연결 시 이전에 참여한 방 자동 재가입

## API 사용 범위

프론트엔드에서 직접 사용하는 주요 엔드포인트는 다음과 같습니다.

- `POST /api/users/register`
- `POST /api/users/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/streams`
- `GET /api/users/:userId/channel`
- `GET /api/users/me/channel`
- `GET /api/vods/channel/:channelId`
- `GET /api/vods/:vodId`
- `POST /api/vods/upload`

## 테스트

루트에는 Playwright 기반 스모크 테스트가 포함되어 있습니다.

```bash
npm run test:e2e
```

현재 테스트는 다음 수준의 기본 점검을 수행합니다.

- `/health` 응답 확인
- 채널/VOD 관련 페이지가 서버 오류 없이 접근 가능한지 확인

추가 테스트 가이드는 [TESTING.md](./TESTING.md)를 참고하세요.

## 참고 사항

- `apps/mobile`은 현재 React Native 앱이 아니라 Next.js 앱입니다.
- 루트 `README.md`는 아직 Turborepo 기본 템플릿 성격이 강합니다.
- 일부 화면 문구는 아직 영문과 한글이 혼재되어 있습니다.
- 실제 동작 품질은 연결된 백엔드 API와 스트리밍 서버 상태에 의존합니다.
