import { test, expect } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, '../../../pr-screenshots');

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

test.describe('PR Screenshots - Home', () => {
  test('capture home page button alignment screenshots', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Test API' })).toBeVisible();

    // Screenshot 2: current clean state (after fix)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'home-02-current-clean.png') });

    // Screenshot 1: current with changed area highlighted
    await page.evaluate(() => {
      const btn = document.querySelector('button:has(.btn-content)') as HTMLElement;
      if (btn) {
        btn.style.outline = '3px solid #f59e0b';
        btn.style.outlineOffset = '4px';
      }
    });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'home-01-current-highlighted.png') });

    // Remove highlight
    await page.evaluate(() => {
      const btn = document.querySelector('button:has(.btn-content)') as HTMLElement;
      if (btn) {
        btn.style.outline = '';
        btn.style.outlineOffset = '';
      }
    });

    // Screenshot 3: simulate previous misaligned state
    await page.evaluate(() => {
      const btnContent = document.querySelector('.btn-content') as HTMLElement;
      if (btnContent) {
        btnContent.style.display = 'inline';
        btnContent.style.alignItems = 'unset';
      }
      const icon = document.querySelector('.btn-content mat-icon') as HTMLElement;
      if (icon) {
        icon.style.verticalAlign = 'top';
        icon.style.marginRight = '8px';
      }
    });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'home-03-previous.png') });
  });
});
