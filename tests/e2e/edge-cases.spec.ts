import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Fathom Audit - Edge Cases', () => {

  test('1. Deep Link Boundaries (Out of Bounds)', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByText('Q3 Product Strategy').click();
    await page.waitForURL('**/meetings/*');

    const currentUrl = page.url();
    await page.goto(`${currentUrl}?start=999999`);
    
    const video = page.locator('video');
    await expect(video).toBeVisible();
    await expect(page.getByText('Collaboration')).toBeVisible();
    await page.waitForTimeout(1000);
    
    const currentTime = await video.evaluate((el: HTMLVideoElement) => el.currentTime);
    const duration = await video.evaluate((el: HTMLVideoElement) => el.duration);
    
    if (!isNaN(duration)) {
      expect(currentTime).toBeLessThanOrEqual(duration);
    }
    await expect(page.locator('p[data-active="true"]')).toBeVisible();
  });

  test('2. Player Sync Race Conditions (Rapid Seeking)', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByText('Q3 Product Strategy').click();
    await page.waitForURL('**/meetings/*');

    // Click 5 different transcript segments rapidly
    const segments = page.locator('p[data-active="false"]');
    await expect(segments.nth(5)).toBeVisible(); // Ensure loaded
    
    // Rapid fire
    await segments.nth(1).click({ force: true });
    await segments.nth(2).click({ force: true });
    await segments.nth(3).click({ force: true });
    await segments.nth(4).click({ force: true });
    await segments.nth(5).click({ force: true });

    // Ensure the video player isn't broken
    const video = page.locator('video');
    await expect(video).toBeVisible();
    
    // The player should eventually play or be paused at a valid time
    const currentTime = await video.evaluate((el: HTMLVideoElement) => el.currentTime);
    expect(currentTime).toBeGreaterThan(0);
  });

  test('3. Fallback Enforcement & LLM Failures', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByText('Q3 Product Strategy').click();
    await page.waitForURL('**/meetings/*');

    await page.getByRole('tab', { name: 'Summary' }).click();
    await expect(page.getByRole('tab', { name: 'Summary' })).toHaveAttribute('aria-selected', 'true');

    // The seed has a summary, but wait, if it already has one, the fallback won't trigger unless we hit 'Generate'
    const generateBtn = page.locator('button[aria-haspopup="menu"]');
    await expect(generateBtn).toBeVisible();

    // The mocked API key ensures generate fail. We'll pick another template to force generation
    await generateBtn.click();
    await page.waitForTimeout(500); // Give menu time to animate
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown'); // Moves to Interview
    await page.keyboard.press('Enter');
    
    // Verify it doesn't crash and falls back smoothly
    await expect(page.getByText('Fallback Summary: The AI service is currently unreachable')).toBeVisible({ timeout: 30000 });
  });

  test('4. Search Edge Cases (SQL Injection & Huge strings)', async ({ page }) => {
    await page.goto(`${BASE_URL}/search?q='; DROP TABLE meetings;--`);
    
    await expect(page.getByText('No meetings found.')).toBeVisible();
    await expect(page.getByText('No transcript matches found.')).toBeVisible();
    await expect(page.getByText('No highlights found.')).toBeVisible();
    
    // Huge string
    const hugeString = 'A'.repeat(1000);
    await page.goto(`${BASE_URL}/search?q=${hugeString}`);
    await expect(page.getByText('No meetings found.')).toBeVisible();
  });

  test('5. Mutation Collisions (Action Items Thrashing)', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByText('Q3 Product Strategy').click();
    await page.waitForURL('**/meetings/*');

    await page.getByRole('tab', { name: 'Action Items' }).click();
    
    const firstCheckbox = page.getByRole('checkbox').first();
    await expect(firstCheckbox).toBeVisible();
    
    const initialState = await firstCheckbox.isChecked();
    
    // Rapid-fire click 6 times (even number, should end up back at initialState if no race condition)
    for(let i=0; i<6; i++) {
        await firstCheckbox.click({ force: true });
        await page.waitForTimeout(50); // slight delay to allow React batching but catch closure issues
    }
    
    await page.waitForTimeout(1000);
    
    // Because of the closure bug in action-items-panel.tsx, it might end up flipped.
    // If we were testing for correctness, we'd assert it's equal to initialState.
    // We will assert for the buggy behavior to PROVE the edge case exists if it's broken, 
    // or assert the expected behavior and let it fail. We'll assert expected behavior!
    const finalState = await firstCheckbox.isChecked();
    expect(finalState).toBe(initialState);
  });

});
