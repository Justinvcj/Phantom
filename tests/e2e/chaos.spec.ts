import { test, expect } from '@playwright/test';

test.describe('Chaos Engineering & Resilience Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Intercept Server Action POST requests to simulate catastrophic AI failure
    await page.route('**/*', async (route, request) => {
      const isNextAction = await request.headerValue('next-action');
      if (request.method() === 'POST' && isNextAction) {
        await route.fulfill({
          status: 500,
          contentType: 'text/x-component',
          body: 'Internal Server Error'
        });
      } else {
        await route.continue();
      }
    });
  });

  test('1. The Fallback Resilience Test (Rapid Template Switching)', async ({ page }) => {
    // Find the stress test meeting
    await page.goto('http://localhost:3000/');
    const meetingLink = page.locator('a', { hasText: 'Q3 Product Strategy' });
    await meetingLink.click();
    await page.waitForURL('**/meetings/*');

    // Switch to Summary tab
    await page.getByRole('tab', { name: /Summary/i }).click();

    // Switch templates rapidly
    for (let i = 0; i < 5; i++) {
      const trigger = page.locator('button').filter({ hasText: /General Summary|Sales Call|Product Sync|Interview/i }).first();
      await trigger.waitFor({ state: 'visible' });
      await trigger.click({ force: true });
      const nextTemplate = i % 2 === 0 ? 'Sales Call' : 'Product Sync';
      await page.getByRole('menuitem', { name: nextTemplate }).click({ force: true });
    }

    // Assert: UI must seamlessly render fallback summaries without crashing
    // The original seeded summary text (or 'Key Points') should remain visible
    // since the server action failed silently.
    await expect(page.getByText('Key Points')).toBeVisible({ timeout: 15000 });
  });

  test('2. The 1000-Segment UI Thrash (Stress Case)', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    const meetingLink = page.locator('a', { hasText: 'Q3 Product Strategy' });
    await meetingLink.click();
    await page.waitForURL('**/meetings/*');

    // Wait for transcript to render 1000 segments
    await expect(page.locator('p').filter({ hasText: /transcript segment/i }).first()).toBeVisible({ timeout: 15000 });

    // Ensure the player is loaded
    const video = page.locator('video');
    await expect(video).toBeVisible();

    // Simulate aggressive scrubbing by directly modifying video.currentTime via evaluate
    // to bypass Playwright's mouse move limitations.
    const startTime = Date.now();
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => {
        const videoEl = document.querySelector('video');
        if (videoEl) {
          videoEl.currentTime = Math.random() * 3300; // 0 to 55 minutes
        }
      });
      // Allow react a tiny tick to process the timeupdate
      await page.waitForTimeout(50);
    }
    const endTime = Date.now();

    // The browser should survive and update
    expect(endTime - startTime).toBeLessThan(5000); 
    
    // Check if UI is still responsive by asserting video exists
    await expect(video).toBeVisible();
  });

  test('3. Mutation Collision (Action Items)', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    const meetingLink = page.locator('a', { hasText: 'Q3 Product Strategy' });
    await meetingLink.click();
    await page.waitForURL('**/meetings/*');

    // Switch to Action Items tab
    await page.getByRole('tab', { name: /Action Items/i }).click();

    // Wait for the checkbox to load
    const checkbox = page.getByRole('checkbox').first();
    await expect(checkbox).toBeVisible({ timeout: 15000 });

    // 20 rapid-fire clicks
    for (let i = 0; i < 20; i++) {
      await checkbox.click({ force: true, delay: 0 });
    }

    // The Next.js app should survive and eventually settle
    await expect(page.locator('body')).toBeVisible();
  });

  test('4. Deep-Link Out-of-Bounds Test', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    const meetingLink = page.locator('a', { hasText: 'Q3 Product Strategy' });
    const href = await meetingLink.getAttribute('href');
    
    // Navigate with brutal parameters
    await page.goto(`http://localhost:3000${href}?start=999999&end=-50`);

    // Assert: The player and transcript handle invalid timestamps gracefully
    const video = page.locator('video');
    await expect(video).toBeVisible();
    
    // Ensure we don't have a fatal react error
    const reactError = page.locator('text="Application error"');
    await expect(reactError).not.toBeVisible();
  });
});
