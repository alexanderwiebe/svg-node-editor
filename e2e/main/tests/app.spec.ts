import { test, expect } from '@playwright/test';

test('main page loads', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Main/);
  await expect(page.locator('body')).toBeVisible();
});

test('test api button returns hello world from backend', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Test API' }).click();

  await expect(page.getByTestId('api-response')).toHaveText('API Response: Hello World!');
});
