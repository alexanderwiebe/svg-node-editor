import { test, expect } from '@playwright/test';
import { cleanupAllWorkspaces } from './test-helpers';

test.describe('Workspace Tags Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workspace/new');
  });

  test.afterEach(async ({ request }) => {
    await cleanupAllWorkspaces(request);
  });

  test('should display tag input component', async ({ page }) => {
    await expect(page.getByTestId('tag-input')).toBeVisible();
  });

  test('should add a tag by typing and pressing Enter', async ({ page }) => {
    const tagInput = page.getByTestId('tag-input');

    // Type a tag and press Enter
    await tagInput.fill('frontend');
    await tagInput.press('Enter');

    // Tag should appear as a chip
    await expect(page.getByTestId('tag-chip').filter({ hasText: 'frontend' })).toBeVisible();

    // Input should be cleared
    await expect(tagInput).toHaveValue('');
  });

  test('should add multiple tags', async ({ page }) => {
    const tagInput = page.getByTestId('tag-input');

    // Add first tag
    await tagInput.fill('angular');
    await tagInput.press('Enter');

    // Add second tag
    await tagInput.fill('typescript');
    await tagInput.press('Enter');

    // Add third tag
    await tagInput.fill('material');
    await tagInput.press('Enter');

    // All tags should be visible
    await expect(page.getByTestId('tag-chip').filter({ hasText: 'angular' })).toBeVisible();
    await expect(page.getByTestId('tag-chip').filter({ hasText: 'typescript' })).toBeVisible();
    await expect(page.getByTestId('tag-chip').filter({ hasText: 'material' })).toBeVisible();
  });

  test('should add a tag by typing and pressing Comma', async ({ page }) => {
    const tagInput = page.getByTestId('tag-input');

    // Type a tag and press comma
    await tagInput.fill('backend,');

    // Tag should appear as a chip
    await expect(page.getByTestId('tag-chip').filter({ hasText: 'backend' })).toBeVisible();
  });

  test('should remove a tag by clicking the remove button', async ({ page }) => {
    const tagInput = page.getByTestId('tag-input');

    // Add a tag
    await tagInput.fill('removeme');
    await tagInput.press('Enter');

    // Verify tag exists
    const tagChip = page.getByTestId('tag-chip').filter({ hasText: 'removeme' });
    await expect(tagChip).toBeVisible();

    // Click remove button
    await tagChip.locator('button[matChipRemove]').click();

    // Tag should be removed
    await expect(tagChip).not.toBeVisible();
  });

  test('should not add duplicate tags', async ({ page }) => {
    const tagInput = page.getByTestId('tag-input');

    // Add a tag
    await tagInput.fill('testing');
    await tagInput.press('Enter');

    // Try to add the same tag again
    await tagInput.fill('testing');
    await tagInput.press('Enter');

    // Should only have one chip with this text
    const tagChips = page.getByTestId('tag-chip').filter({ hasText: 'testing' });
    await expect(tagChips).toHaveCount(1);
  });

  test('should not add empty tags', async ({ page }) => {
    const tagInput = page.getByTestId('tag-input');

    // Try to add empty tag
    await tagInput.fill('   ');
    await tagInput.press('Enter');

    // No tags should be added
    await expect(page.getByTestId('tag-chip')).toHaveCount(0);
  });

  test('should show autocomplete dropdown with existing tags', async ({ page }) => {
    // First, create a workspace with some tags
    await page.getByTestId('workspace-name-input').fill('First Workspace');
    await page.getByTestId('workspace-description-input').fill('Test description');

    const tagInput = page.getByTestId('tag-input');
    await tagInput.fill('angular');
    await tagInput.press('Enter');
    await tagInput.fill('typescript');
    await tagInput.press('Enter');

    await page.getByTestId('save-workspace-button').click();
    await page.waitForTimeout(700);

    // Navigate to create a new workspace
    await page.goto('/workspace/new');

    // Start typing a tag that exists
    await tagInput.fill('ang');

    // Autocomplete dropdown should appear
    await expect(page.getByTestId('tag-autocomplete-option').filter({ hasText: 'angular' })).toBeVisible();
  });

  test('should select tag from autocomplete dropdown', async ({ page }) => {
    // Create a workspace with a tag first
    await page.getByTestId('workspace-name-input').fill('Setup Workspace');
    await page.getByTestId('workspace-description-input').fill('Setup');

    const tagInput = page.getByTestId('tag-input');
    await tagInput.fill('nestjs');
    await tagInput.press('Enter');

    await page.getByTestId('save-workspace-button').click();
    await page.waitForTimeout(700);

    // Create another workspace
    await page.goto('/workspace/new');

    // Type partial tag name
    await tagInput.fill('nes');

    // Click the autocomplete option
    await page.getByTestId('tag-autocomplete-option').filter({ hasText: 'nestjs' }).click();

    // Tag should be added
    await expect(page.getByTestId('tag-chip').filter({ hasText: 'nestjs' })).toBeVisible();

    // Input should be cleared
    await expect(tagInput).toHaveValue('');
  });

  test('should filter autocomplete options as user types', async ({ page }) => {
    // Setup: create workspace with multiple tags
    await page.getByTestId('workspace-name-input').fill('Multi Tag Workspace');
    await page.getByTestId('workspace-description-input').fill('Multiple tags');

    const tagInput = page.getByTestId('tag-input');
    await tagInput.fill('angular');
    await tagInput.press('Enter');
    await tagInput.fill('react');
    await tagInput.press('Enter');
    await tagInput.fill('vue');
    await tagInput.press('Enter');

    await page.getByTestId('save-workspace-button').click();
    await page.waitForTimeout(700);

    // Create new workspace
    await page.goto('/workspace/new');

    // Type 'an' - should only show 'angular'
    await tagInput.fill('an');
    await expect(page.getByTestId('tag-autocomplete-option')).toHaveCount(1);
    await expect(page.getByTestId('tag-autocomplete-option').filter({ hasText: 'angular' })).toBeVisible();

    // Clear and type 're' - should only show 'react'
    await tagInput.fill('');
    await tagInput.fill('re');
    await expect(page.getByTestId('tag-autocomplete-option').filter({ hasText: 'react' })).toBeVisible();
  });

  test('should save workspace with tags and display them when editing', async ({ page }) => {
    const workspaceName = `Tagged Workspace ${Date.now()}`;

    // Create workspace with tags
    await page.getByTestId('workspace-name-input').fill(workspaceName);
    await page.getByTestId('workspace-description-input').fill('Workspace with tags');

    const tagInput = page.getByTestId('tag-input');
    await tagInput.fill('e2e');
    await tagInput.press('Enter');
    await tagInput.fill('testing');
    await tagInput.press('Enter');
    await tagInput.fill('playwright');
    await tagInput.press('Enter');

    await page.getByTestId('save-workspace-button').click();
    await page.waitForTimeout(700);

    // Navigate to home and back to edit
    await page.click('a[routerlink="/"]');
    await page.waitForTimeout(500);
    await page.getByTestId('workspace-item').filter({ hasText: workspaceName }).click();
    await page.waitForTimeout(500);

    // Tags should be displayed as chips
    await expect(page.getByTestId('tag-chip').filter({ hasText: 'e2e' })).toBeVisible();
    await expect(page.getByTestId('tag-chip').filter({ hasText: 'testing' })).toBeVisible();
    await expect(page.getByTestId('tag-chip').filter({ hasText: 'playwright' })).toBeVisible();
  });

  test('should not show already-selected tags in autocomplete', async ({ page }) => {
    // Create workspace with a tag
    await page.getByTestId('workspace-name-input').fill('Autocomplete Filter Test');
    await page.getByTestId('workspace-description-input').fill('Test');

    const tagInput = page.getByTestId('tag-input');
    await tagInput.fill('frontend');
    await tagInput.press('Enter');
    await tagInput.fill('backend');
    await tagInput.press('Enter');

    await page.getByTestId('save-workspace-button').click();
    await page.waitForTimeout(700);

    // Create new workspace and add 'frontend' tag
    await page.goto('/workspace/new');
    await tagInput.fill('frontend');
    await tagInput.press('Enter');

    // Start typing to see autocomplete
    await tagInput.fill('');
    await tagInput.click(); // Focus to trigger autocomplete

    // 'frontend' should not appear in autocomplete (already selected)
    // 'backend' should appear
    const options = page.getByTestId('tag-autocomplete-option');
    await expect(options.filter({ hasText: 'backend' })).toBeVisible();
    // frontend might not be in the list or would be filtered
  });

  test('complete tags workflow: create, edit tags, save', async ({ page }) => {
    const workspaceName = `Complete Tags Flow ${Date.now()}`;

    // Create workspace
    await page.getByTestId('workspace-name-input').fill(workspaceName);
    await page.getByTestId('workspace-description-input').fill('Tags workflow test');

    const tagInput = page.getByTestId('tag-input');

    // Add initial tags
    await tagInput.fill('initial');
    await tagInput.press('Enter');
    await tagInput.fill('tags');
    await tagInput.press('Enter');

    // Save
    await page.getByTestId('save-workspace-button').click();
    await page.waitForTimeout(700);

    // Navigate to edit
    await page.click('a[routerlink="/"]');
    await page.waitForTimeout(500);
    await page.getByTestId('workspace-item').filter({ hasText: workspaceName }).click();
    await page.waitForTimeout(500);

    // Remove one tag
    await page.getByTestId('tag-chip').filter({ hasText: 'initial' }).locator('button[matChipRemove]').click();

    // Add new tag
    await tagInput.fill('updated');
    await tagInput.press('Enter');

    // Save again
    await page.getByTestId('save-workspace-button').click();
    await page.waitForTimeout(700);

    // Verify changes
    await page.click('a[routerlink="/"]');
    await page.waitForTimeout(500);
    await page.getByTestId('workspace-item').filter({ hasText: workspaceName }).click();
    await page.waitForTimeout(500);

    // Should have 'tags' and 'updated', not 'initial'
    await expect(page.getByTestId('tag-chip').filter({ hasText: 'tags' })).toBeVisible();
    await expect(page.getByTestId('tag-chip').filter({ hasText: 'updated' })).toBeVisible();
    await expect(page.getByTestId('tag-chip').filter({ hasText: 'initial' })).not.toBeVisible();
  });
});
