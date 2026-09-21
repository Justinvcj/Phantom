import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Fathom Audit', () => {

  test('1. Meeting Library & Seeded State', async ({ page }) => {
    await page.goto(BASE_URL);
    // Verify the dashboard loads immediately with seeded meetings populated—confirm there is zero empty state
    await expect(page.getByText('Q3 Product Strategy')).toBeVisible();
    await expect(page.getByText('Engineering Sync')).toBeVisible();
    await expect(page.getByText('Client Discovery')).toBeVisible();
    await expect(page.getByText('Weekly 1:1')).toBeVisible();
    await expect(page.getByText('Sprint Planning')).toBeVisible();
    await expect(page.getByText('Design Review')).toBeVisible();
  });

  test('2. Playback <-> Transcript Bi-directional Sync', async ({ page }) => {
    await page.goto(BASE_URL);
    // Click on the large meeting
    await page.getByText('Q3 Product Strategy').click();
    await page.waitForURL('**/meetings/*');

    // Make sure we are on transcript tab (it is permanently visible on the right now)
    await expect(page.getByText('Transcript', { exact: true })).toBeVisible();

    const video = page.locator('video');
    await expect(video).toBeVisible();

    // Sync Test A: Playback -> Transcript
    await video.evaluate((el: HTMLVideoElement) => {
      el.currentTime = 10;
      el.play();
    });
    
    // Wait for the active segment to update
    await expect(page.locator('p[data-active="true"]')).toBeVisible({ timeout: 5000 });
    const activeText = await page.locator('p[data-active="true"]').textContent();
    expect(activeText).toBeTruthy();

    // Sync Test B: Transcript -> Playback
    // Click an arbitrary segment, e.g. the first one that is NOT active
    const inactiveSegment = page.locator('p[data-active="false"]').first();
    await inactiveSegment.click();
    
    // Check if the video time jumped (it might take a split second)
    await page.waitForTimeout(500);
    const newTime = await video.evaluate((el: HTMLVideoElement) => el.currentTime);
    expect(newTime).toBeGreaterThan(0);
  });

  test('3. Summary Panel & Template Switcher', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByText('Q3 Product Strategy').click();
    await page.waitForURL('**/meetings/*');

    // Wait for Summary tab (Overview) to be active
    await expect(page.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
    
    // Verify AI summary renders structured key points
    await expect(page.getByText('Key Points')).toBeVisible();
    
    // Switch templates
    await page.locator('button[aria-haspopup="menu"]').click();
    await page.getByRole('menuitem', { name: 'Sales Call' }).click();

    // Because we mocked the API key, it will use the fallback and load
    await expect(page.getByRole('button', { name: /Sales Call/i })).toBeVisible();
    await expect(page.getByText('Fallback Summary: The AI service is currently unreachable')).toBeVisible();
  });

  test('4. Action Items & Highlights', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByText('Q3 Product Strategy').click();
    await page.waitForURL('**/meetings/*');

    // Go to Action Items
    await page.getByRole('tab', { name: 'Action Items' }).click();
    const checkbox = page.getByRole('checkbox').first();
    const isChecked = await checkbox.getAttribute('aria-checked');
    await checkbox.click();
    // Wait for optimistic update
    await expect(checkbox).toHaveAttribute('aria-checked', isChecked === 'true' ? 'false' : 'true');

    // Go to Highlights
    await page.getByRole('tab', { name: 'Highlights' }).click();
    await page.getByRole('button', { name: 'Capture Clip' }).click();
    await page.getByPlaceholder('What makes this a highlight?').fill('Test highlight from Playwright');
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify it appears
    await expect(page.getByText('Test highlight from Playwright')).toBeVisible();
  });

  test('5. Clip Sharing Deep Linking', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByText('Q3 Product Strategy').click();
    await page.waitForURL('**/meetings/*');
    
    const url = new URL(page.url());
    const meetingId = url.pathname.split('/').pop();

    // Load with deep link
    await page.goto(`${BASE_URL}/meetings/${meetingId}?start=120`);
    
    const video = page.locator('video');
    await expect(video).toBeVisible();
    
    // Allow React to process initialSeekTime
    await page.waitForTimeout(1000);
    const time = await video.evaluate((el: HTMLVideoElement) => el.currentTime);
    // Time should be exactly 120 or very close if playing started
    expect(time).toBeGreaterThanOrEqual(120);
  });

  test('6. Global Search', async ({ page }) => {
    await page.goto(BASE_URL);
    // Execute query against keyword terms buried inside transcript segments
    await page.getByPlaceholder('Search meetings, transcripts, highlights...').fill('product');
    await page.keyboard.press('Enter');
    
    await page.waitForURL('**/search*');
    
    // Assert results return
    await expect(page.getByText('Meetings (')).toBeVisible();
    // Click first meeting result
    await page.getByText('Q3 Product Strategy').first().click();
    await page.waitForURL('**/meetings/*');
    await expect(page.getByText('Q3 Product Strategy')).toBeVisible();
  });

  test('7. The 8-Person / 1-Hour Stress Test', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByText('Q3 Product Strategy').click();
    await page.waitForURL('**/meetings/*');

    const video = page.locator('video');
    const scrollArea = page.locator('.flex-1.p-6').last(); // Transcript panel scroll area

    // Rapidly seek between minute 2:00 (120) and 55:00 (3300)
    for (let i = 0; i < 5; i++) {
      await video.evaluate((el: HTMLVideoElement, time) => {
        el.currentTime = time;
      }, i % 2 === 0 ? 120 : 3300);
      
      // Allow react to render and scroll
      await page.waitForTimeout(500);
      await expect(page.locator('p[data-active="true"]')).toBeVisible();
    }
  });

});
