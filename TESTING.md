# 테스트 가이드 (로컬)

## 준비
- 서버(`streaming_server`)를 로컬 도커/localhost:4000에서 실행(헬스체크: `http://localhost:4000/health`).
- 클라이언트 `.env` 설정:
  - `NEXT_PUBLIC_API_URL=http://localhost:4000`
  - `NEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:4000`
  - `NEXT_PUBLIC_STREAMING_SERVER_URL=http://localhost:<media-port>`
- 루트에서 `npm install` 후 `npm run dev -- --filter=web` 등으로 실행.

## 스모크 체크 리스트 (수동/E2E 기준)
- 인증
  - 회원가입/로그인 후 액세스 토큰이 저장되고 API 호출 시 Authorization 헤더가 붙는지 확인.
  - 액세스 토큰 만료(서버 설정 낮춰서) 후, 요청이 401에서 refresh로 회복되는지 확인.
  - 로그아웃 시 refreshToken이 서버에 폐기되고 로컬 토큰이 삭제되는지 확인.
- 스트림/VOD
  - `/`에서 스트림 목록 노출.
  - `/channel/{userId}`에서 채널/플레이어 렌더, 스트리밍 서버 URL 미설정 시 경고 노출.
  - `/channel/{userId}/vods`에서 VOD 목록 조회.
  - `/vod/upload`에서 파일 업로드 → 업로드 완료 메시지 후 목록 새로고침 시 반영 확인.
- 채팅
  - 로그인 상태에서 채팅 연결 성공, 메시지 송수신.
  - 네트워크 단절/토큰 갱신 후 방 재가입 및 연결 유지 확인.

## E2E 러너 (Playwright)
- 설치: `npm install`
- 실행: `npm run test:e2e` (기본 baseURL은 `http://localhost:4000`, 변경 시 `E2E_BASE_URL` 지정)
- 테스트 위치: `tests/e2e/smoke.spec.ts`

## 자동화 제안 (향후)
- Playwright/Next 테스트 러너로 위 스모크 플로우를 자동화.
- 소켓 연결/재연결을 Cypress e2e나 Vitest 환경에서 가짜 서버로 검증.
