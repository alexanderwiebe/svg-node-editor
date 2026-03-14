import { test, expect } from '@playwright/test';

async function cleanupAllWorkspaces(request: import('@playwright/test').APIRequestContext): Promise<void> {
  const response = await request.get('http://localhost:3000/workspaces');
  if (response.ok()) {
    const workspaces = await response.json();
    for (const workspace of workspaces) {
      await request.delete(`http://localhost:3000/workspaces/${workspace.id}`);
    }
  }
}

test.describe('Search Functionality', () => {
  test.afterEach(async ({ request }) => {
    await cleanupAllWorkspaces(request);
  });

  test.beforeEach(async ({ page }) => {
    // Create some test workspaces for searching
    await page.goto('/workspace/new');

    // Workspace 1
    await page.getByTestId('workspace-name-input').fill('Frontend Project');
    await page.getByTestId('workspace-description-input').fill('Angular frontend application');
    const tagInput = page.getByTestId('tag-input');
    await tagInput.fill('angular');
    await tagInput.press('Enter');
    await tagInput.fill('typescript');
    await tagInput.press('Enter');
    await tagInput.fill('frontend');
    await tagInput.press('Enter');
    await page.getByTestId('save-workspace-button').click();
    await page.waitForTimeout(700);

    // Workspace 2
    await page.goto('/workspace/new');
    await page.getByTestId('workspace-name-input').fill('Backend Services');
    await page.getByTestId('workspace-description-input').fill('NestJS backend services');
    await tagInput.fill('nestjs');
    await tagInput.press('Enter');
    await tagInput.fill('typescript');
    await tagInput.press('Enter');
    await tagInput.fill('backend');
    await tagInput.press('Enter');
    await page.getByTestId('save-workspace-button').click();
    await page.waitForTimeout(700);

    // Workspace 3
    await page.goto('/workspace/new');
    await page.getByTestId('workspace-name-input').fill('Mobile App');
    await page.getByTestId('workspace-description-input').fill('React Native mobile application');
    await tagInput.fill('react-native');
    await tagInput.press('Enter');
    await tagInput.fill('mobile');
    await tagInput.press('Enter');
    await tagInput.fill('frontend');
    await tagInput.press('Enter');
    await page.getByTestId('save-workspace-button').click();
    await page.waitForTimeout(700);

    // Navigate to search page
    await page.goto('/search');
  });

  test('should navigate to search page from sidebar', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('search-nav-link').click();
    await expect(page).toHaveURL('/search');
    await expect(page.locator('h1')).toHaveText('Search Workspaces');
  });

  test('should display search page elements', async ({ page }) => {
    await expect(page.getByTestId('search-name-input')).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: 'Filter by Tags' })).toBeVisible();
    await expect(page.locator('h4').filter({ hasText: 'Available Tags' })).toBeVisible();
  });

  test('should display all workspaces when no search criteria', async ({ page }) => {
    const results = page.getByTestId('search-result-item');
    await expect(results).toHaveCount(3);
  });

  test('should search workspaces by name (exact match)', async ({ page }) => {
    const searchInput = page.getByTestId('search-name-input');
    await searchInput.fill('Frontend Project');

    await expect(page.getByTestId('search-result-item')).toHaveCount(1);
    await expect(page.getByTestId('search-result-item').filter({ hasText: 'Frontend Project' })).toBeVisible();
  });

  test('should search workspaces by name (partial match)', async ({ page }) => {
    const searchInput = page.getByTestId('search-name-input');
    await searchInput.fill('Backend');

    await expect(page.getByTestId('search-result-item')).toHaveCount(1);
    await expect(page.getByTestId('search-result-item').filter({ hasText: 'Backend Services' })).toBeVisible();
  });

  test('should search workspaces case-insensitively', async ({ page }) => {
    const searchInput = page.getByTestId('search-name-input');
    await searchInput.fill('MOBILE');

    await expect(page.getByTestId('search-result-item')).toHaveCount(1);
    await expect(page.getByTestId('search-result-item').filter({ hasText: 'Mobile App' })).toBeVisible();
  });

  test('should show no results for non-matching search', async ({ page }) => {
    const searchInput = page.getByTestId('search-name-input');
    await searchInput.fill('NonExistentWorkspace');

    await expect(page.getByTestId('no-results')).toBeVisible();
    await expect(page.getByTestId('no-results')).toContainText('No workspaces found');
  });

  test('should clear name search with clear button', async ({ page }) => {
    const searchInput = page.getByTestId('search-name-input');
    await searchInput.fill('Frontend');

    // Should show filtered results
    await expect(page.getByTestId('search-result-item')).toHaveCount(2); // Frontend Project and Mobile App

    // Click clear button
    await page.getByTestId('clear-name-search').click();

    // Should show all results
    await expect(page.getByTestId('search-result-item')).toHaveCount(3);
    await expect(searchInput).toHaveValue('');
  });

  test('should display available tags with counts', async ({ page }) => {
    const availableTags = page.getByTestId('available-tag-chip');

    // Should have tags from all workspaces
    await expect(availableTags).toHaveCount(7); // angular, typescript, frontend, nestjs, backend, react-native, mobile

    // Check that badges are present (indicating counts)
    await expect(availableTags.filter({ hasText: 'typescript' })).toBeVisible();
    await expect(availableTags.filter({ hasText: 'frontend' })).toBeVisible();
  });

  test('should filter workspaces by single tag', async ({ page }) => {
    // Click on 'angular' tag
    await page.getByTestId('available-tag-chip').filter({ hasText: 'angular' }).click();

    // Should show selected tag
    await expect(page.getByTestId('selected-tag-chip').filter({ hasText: 'angular' })).toBeVisible();

    // Should filter results
    await expect(page.getByTestId('search-result-item')).toHaveCount(1);
    await expect(page.getByTestId('search-result-item').filter({ hasText: 'Frontend Project' })).toBeVisible();
  });

  test('should filter workspaces by multiple tags (AND logic)', async ({ page }) => {
    // Click on 'typescript' tag
    await page.getByTestId('available-tag-chip').filter({ hasText: 'typescript' }).click();

    // Should show 2 workspaces (Frontend Project and Backend Services both have typescript)
    await expect(page.getByTestId('search-result-item')).toHaveCount(2);

    // Now add 'frontend' tag
    await page.getByTestId('available-tag-chip').filter({ hasText: 'frontend' }).click();

    // Should show only 1 workspace (only Frontend Project has both typescript AND frontend)
    await expect(page.getByTestId('search-result-item')).toHaveCount(1);
    await expect(page.getByTestId('search-result-item').filter({ hasText: 'Frontend Project' })).toBeVisible();
  });

  test('should remove tag filter by clicking remove button', async ({ page }) => {
    // Add tag filter
    await page.getByTestId('available-tag-chip').filter({ hasText: 'backend' }).click();

    // Verify filter applied
    await expect(page.getByTestId('search-result-item')).toHaveCount(1);

    // Remove tag filter
    await page.getByTestId('selected-tag-chip').filter({ hasText: 'backend' }).locator('button[matChipRemove]').click();

    // Should show all results
    await expect(page.getByTestId('search-result-item')).toHaveCount(3);
  });

  test('should clear all tag filters with clear button', async ({ page }) => {
    // Add multiple tag filters
    await page.getByTestId('available-tag-chip').filter({ hasText: 'typescript' }).click();
    await page.getByTestId('available-tag-chip').filter({ hasText: 'frontend' }).click();

    // Verify filters applied
    await expect(page.getByTestId('selected-tag-chip')).toHaveCount(2);

    // Click clear all button
    await page.getByTestId('clear-tag-filters').click();

    // All tag filters should be removed
    await expect(page.getByTestId('selected-tag-chip')).toHaveCount(0);

    // Should show all results
    await expect(page.getByTestId('search-result-item')).toHaveCount(3);
  });

  test('should combine name search and tag filter', async ({ page }) => {
    // Search by name
    const searchInput = page.getByTestId('search-name-input');
    await searchInput.fill('Frontend');

    // Should show 2 results (Frontend Project and Mobile App)
    await expect(page.getByTestId('search-result-item')).toHaveCount(2);

    // Add tag filter
    await page.getByTestId('available-tag-chip').filter({ hasText: 'angular' }).click();

    // Should show only 1 result (Frontend Project has both "Frontend" in name and "angular" tag)
    await expect(page.getByTestId('search-result-item')).toHaveCount(1);
    await expect(page.getByTestId('search-result-item').filter({ hasText: 'Frontend Project' })).toBeVisible();
  });

  test('should not show selected tags in available tags list', async ({ page }) => {
    // Click on a tag
    await page.getByTestId('available-tag-chip').filter({ hasText: 'mobile' }).click();

    // Tag should appear in selected tags
    await expect(page.getByTestId('selected-tag-chip').filter({ hasText: 'mobile' })).toBeVisible();

    // Tag should be disabled or not clickable in available tags
    const availableTag = page.getByTestId('available-tag-chip').filter({ hasText: 'mobile' });
    await expect(availableTag).toBeDisabled();
  });

  test('should navigate to workspace when clicking search result', async ({ page }) => {
    // Click on a search result
    await page.getByTestId('search-result-item').filter({ hasText: 'Backend Services' }).click();

    // Should navigate to workspace edit page
    await page.waitForTimeout(500);
    await expect(page.locator('h1')).toContainText('Backend Services');
    await expect(page.getByTestId('workspace-name-input')).toHaveValue('Backend Services');
  });

  test('should display workspace metadata in search results', async ({ page }) => {
    const result = page.getByTestId('search-result-item').filter({ hasText: 'Frontend Project' });

    // Should display tags
    await expect(result).toContainText('angular');
    await expect(result).toContainText('typescript');
    await expect(result).toContainText('frontend');

    // Should display description
    await expect(result).toContainText('Angular frontend application');
  });

  test('should show result count', async ({ page }) => {
    // All results
    await expect(page.locator('.result-count')).toContainText('(3)');

    // Filter by name
    await page.getByTestId('search-name-input').fill('Project');
    await expect(page.locator('.result-count')).toContainText('(1)');
  });

  test('complete search workflow: name + tags + clear', async ({ page }) => {
    // Start with all results
    await expect(page.getByTestId('search-result-item')).toHaveCount(3);

    // Search by name
    await page.getByTestId('search-name-input').fill('App');
    await expect(page.getByTestId('search-result-item')).toHaveCount(1);

    // Clear name search
    await page.getByTestId('clear-name-search').click();
    await expect(page.getByTestId('search-result-item')).toHaveCount(3);

    // Filter by tag
    await page.getByTestId('available-tag-chip').filter({ hasText: 'frontend' }).click();
    await expect(page.getByTestId('search-result-item')).toHaveCount(2);

    // Add another tag
    await page.getByTestId('available-tag-chip').filter({ hasText: 'typescript' }).click();
    await expect(page.getByTestId('search-result-item')).toHaveCount(1);

    // Clear all tag filters
    await page.getByTestId('clear-tag-filters').click();
    await expect(page.getByTestId('search-result-item')).toHaveCount(3);
  });
});
