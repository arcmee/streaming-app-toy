import { test, expect } from '@playwright/test';

test.describe('Smoke', () => {
  test('헬스 체크가 응답한다', async ({ page }) => {
    const response = await page.goto('/health');
    if (!response) {
      test.skip(true, '헬스 체크 응답이 없습니다. 서버가 실행 중인지 확인하세요.');
    }
    expect(response!.ok()).toBeTruthy();
  });

  test('채널/VOD 페이지가 기본적으로 접근 가능하다(데이터 여부 무관)', async ({ page }) => {
    // 데이터가 없어도 200 응답 확인용 경로 예시: 첫 번째 채널 userId를 1로 가정한 기본 체크
    const res = await page.goto('/channel/1/vods', { waitUntil: 'domcontentloaded' });
    if (!res) {
      test.skip(true, '페이지 응답이 없습니다. 서버가 실행 중인지 확인하세요.');
    }
    expect(res!.status()).toBeLessThan(500);
  });
});
