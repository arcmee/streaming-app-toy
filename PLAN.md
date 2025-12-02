# 스트리밍 클라이언트 개발 계획 (Turborepo + 클린 아키텍처)

## 1. 개요

이 문서는 `streaming_server`를 위한 웹 및 모바일 클라이언트 개발 계획을 기술합니다. 프로젝트는 **Turborepo**를 사용한 모노레포 구조를 가지며, 웹과 앱 모두 **클린 아키텍처** 원칙을 적용하여 높은 수준의 코드 공유, 테스트 용이성 및 유지보수성을 목표로 합니다.

---

## 2. 핵심 아키텍처 및 기술 스택

- **모노레포:** Turborepo
- **웹 프론트엔드:** Next.js (React, TypeScript)
- **모바일 앱:** React Native (TypeScript)
- **아키텍처:** 클린 아키텍처
  - `domain`: 핵심 데이터 모델 및 타입
  - `application`: 유스케이스 (비즈니스 로직)
  - `infrastructure`: API 클라이언트, 외부 서비스 연동
  - `presentation`: UI 컴포넌트, 페이지/화면, 훅
- **공유 패키지 (`/packages`):**
  - `logic`: API 연동, 상태 관리 등 웹/앱 공통 로직
  - `ui`: 디자인 시스템에 따른 공통 UI 컴포넌트 (Button, Card 등)

---

## 3. 개발 단계

### 1단계: 모노레포 및 아키텍처 기반 구축
1.  `Turborepo`를 사용하여 모노레포 기본 구조 생성.
2.  `apps` 디렉토리 내에 `web` (Next.js) 및 `mobile` (React Native) 프로젝트 생성.
3.  `web`과 `mobile` 프로젝트 각각에 클린 아키텍처 디렉토리 구조(`domain`, `application`, `infrastructure`, `presentation`) 설정.
4.  공유 패키지 `packages/logic` 및 `packages/ui` 초기 설정.
5.  **목표:** 모노레포 내에서 웹과 모바일 앱이 성공적으로 빌드되고, 공유 패키지의 코드를 가져와 사용하는 것을 확인.

### 2단계: 사용자 인증 시스템
1.  `packages/logic`에 `streaming-server`의 사용자 API(`register`, `login`)를 호출하는 클라이언트 로직 구현.
2.  `presentation` 계층에 회원가입 및 로그인 페이지/화면 구현.
3.  JWT 토큰 저장 및 인증이 필요한 API 요청 처리 로직 구현 (예: Axios 인터셉터).
4.  **보안 강화**: 현재 `localStorage`에 저장된 JWT 토큰을 더 안전한 방식(예: HTTP-only 쿠키)으로 전환하여 XSS 공격에 대한 방어 강화.

### 3단계: 핵심 스트리밍 기능
1.  실시간 방송 목록을 보여주는 메인 페이지/화면 구현 (`GET /api/streams`).
2.  방송 상세 및 시청 페이지/화면 구현.
    - `React Player` 등 비디오 플레이어 컴포넌트 연동.
    - 채널 정보 표시.

### 4단계: 실시간 채팅
1.  `packages/logic`에 `Socket.IO` 클라이언트 설정 및 기본 핸들러 구현.
2.  방송 시청 화면에 채팅 UI 컴포넌트 추가.
3.  채팅 메시지 전송 및 수신 기능 구현.

### 5단계: VOD 시스템
1.  채널별 VOD 목록을 보여주는 페이지/화면 구현.
2.  VOD 시청 페이지/화면 구현.

### 6단계: UI/UX 고도화
1.  `packages/ui`에 정의된 공통 컴포넌트를 사용하여 전체적인 디자인 일관성 확보.
2.  웹의 경우, 반응형 디자인을 적용하여 다양한 화면 크기 지원.
3.  사용자 경험을 개선하기 위한 애니메이션 및 전환 효과 추가.

### 7단계: 자동화된 테스트
1.  테스트 프레임워크(Jest, React Testing Library) 설정.
2.  `application` 계층의 핵심 유스케이스에 대한 유닛 테스트 작성.
3.  주요 UI 컴포넌트 및 페이지에 대한 통합 테스트 작성.

codex resume 019ada2d-4000-7ea1-8ce4-8ded181681fe