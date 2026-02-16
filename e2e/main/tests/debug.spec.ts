import { test } from '@playwright/test';

test('debug - print all test-ids', async ({ page }) => {
  await page.goto('/');

  // Wait for page to load
  await page.waitForTimeout(2000);

  // Get all elements with data-testid
  const testIds = await page.$$eval('[data-testid]', elements =>
    elements.map(el => ({
      testId: el.getAttribute('data-testid'),
      tag: el.tagName,
      text: el.textContent?.substring(0, 50)
    }))
  );

  console.log('Found test IDs:', JSON.stringify(testIds, null, 2));

  // Get the full HTML of the sidebar
  const sidebarHTML = await page.locator('app-sidebar').innerHTML();
  console.log('Sidebar HTML:\n', sidebarHTML.substring(0, 1000));
});
