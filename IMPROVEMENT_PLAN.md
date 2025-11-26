# 개선 계획 (브랜치: `improvement/auth-endpoints`)

목적: 로컬(도커/localhost) 환경에서 클라이언트-서버 정합성과 안정성을 강화하고 진행 상황을 추적합니다.

## 목표
- API/WS/스트리밍 엔드포인트를 서버 계약과 기본 환경에 맞춥니다.
- 웹+모바일(RN) 클라이언트의 인증·채팅 플로우를 안정화합니다.
- 누락된 VOD 기능과 최소 스모크 테스트 가이드를 제공합니다.

## 작업 트래커
- [x] API 기본 URL을 `http://localhost:3000`으로 정렬.
- [x] 스트림/VOD 경로에 `/api` 프리픽스 적용, VOD 채널 목록을 channelId(userId) 기준으로 수정.
- [ ] 인증 저장 전략: 웹(HTTP-only 쿠키) + RN(안전 스토리지+Bearer) 이중 모드 설계, 토큰 갱신 방안 결정. (현재는 Bearer + refresh JSON 플로우 적용, 쿠키 전환은 서버 지원 필요)
- [x] 소켓 회복력: 재연결/백오프+방 재가입 구현, 연결 오류·토큰 만료 신호 콜백 추가, 토큰 갱신 시 `updateToken`으로 적용 가능.
- [x] 스트리밍 URL 안전성: `NEXT_PUBLIC_STREAMING_SERVER_URL` 검증, 경고 UI, 포트 문서화.
- [x] VOD 업로드: `POST /api/vods/upload` 웹 클라이언트/화면 추가(업로드 후 목록 새로고침은 페이지 리프레시; 모바일은 추후).
- [x] 환경 문서: `.env.example`에 API/WS/스트리밍 URL과 JWT/쿠키 노트 추가, README/AGENTS에 안내.
- [ ] 테스트: 스트림 목록, 채널 VOD, 인증(해피패스), 채팅 connect/disconnect 등 최소 스모크/통합 테스트. (임시 수동 체크리스트는 TESTING.md 참고)

## 메모
- 현재 관례는 `channelId === userId`; 서버에 slug/별도 식별자가 없습니다. 채널 엔티티 도입 전까지 이 관례를 유지합니다.
- 서버는 HTTP/S와 Socket.IO 모두 Bearer 인증과 refresh 토큰(JSON 응답)을 제공합니다. 웹 쿠키 전환은 서버의 Set-Cookie 지원이 추가될 때 진행합니다.
