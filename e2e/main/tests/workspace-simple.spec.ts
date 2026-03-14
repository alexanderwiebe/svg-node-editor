import { test, expect } from '@playwright/test';
import { cleanupAllWorkspaces } from './test-helpers';

test.afterEach(async ({ request }) => {
  await cleanupAllWorkspaces(request);
});

test('simple workspace creation', async ({ page }) => {
  // Listen for console logs
  page.on('console', msg => {
    if (msg.text().includes('Workspace') || msg.text().includes('Total')) {
      console.log('Browser:', msg.text());
    }
  });

  // Create workspace
  await page.goto('/workspace/new');
  await page.getByTestId('workspace-name-input').fill('Simple Test');
  await page.getByTestId('workspace-description-input').fill('Simple description');
  await page.getByTestId('save-workspace-button').click();

  // Wait for save to complete
  await page.waitForTimeout(700);

  // Form should be reset
  const nameValue = await page.getByTestId('workspace-name-input').inputValue();
  console.log('Form reset?', nameValue === '');

  // Navigate using the home link (router navigation, not page reload)
  await page.click('a[routerlink="/"]');
  await page.waitForTimeout(2000);

  // Just check if any workspace items exist
  const count = await page.locator('[data-testid="workspace-item"]').count();
  console.log('Workspace items found:', count);

  // If items exist, list them
  if (count > 0) {
    const items = await page.$$eval('[data-testid="workspace-item"]', els =>
      els.map(el => el.textContent?.trim())
    );
    console.log('Items:', items);
  }

  // Check sidebar HTML for the word "Simple"
  const html = await page.locator('app-sidebar').innerHTML();
  const containsSimple = html.includes('Simple');
  console.log('Sidebar contains "Simple":', containsSimple);

  expect(count).toBeGreaterThan(0);
});
