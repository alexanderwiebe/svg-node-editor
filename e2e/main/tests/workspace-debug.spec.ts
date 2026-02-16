import { test, expect } from '@playwright/test';

test('debug workspace save and store', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => console.log('Browser log:', msg.text()));

  await page.goto('/workspace/new');

  // Add script to log store state
  await page.evaluate(() => {
    console.log('Page loaded, checking for store...');
  });

  // Fill and save workspace
  await page.getByTestId('workspace-name-input').fill('Debug Workspace');
  await page.getByTestId('workspace-description-input').fill('Debug description');

  // Log before click
  await page.evaluate(() => console.log('About to click save button'));

  await page.getByTestId('save-workspace-button').click();

  // Wait for save operation
  await page.waitForTimeout(700);

  // Check if workspace was saved by looking at form reset
  const nameValue = await page.getByTestId('workspace-name-input').inputValue();
  console.log('Name input value after save:', nameValue);

  // Navigate home
  await page.goto('/');
  await page.waitForTimeout(1000);

  // Check workspace items
  const workspaceItems = await page.getByTestId('workspace-item').count();
  console.log('Workspace items count:', workspaceItems);

  const items = await page.$$eval('[data-testid="workspace-item"]', elements =>
    elements.map(el => el.textContent?.trim())
  );
  console.log('Workspace items:', JSON.stringify(items));

  // Check if tree is expanded
  const toggleIcon = await page.getByTestId('toggle-workspaces').locator('mat-icon').textContent();
  console.log('Toggle icon:', toggleIcon);
});
