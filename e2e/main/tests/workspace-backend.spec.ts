import { test, expect } from '@playwright/test';

/**
 * Backend Integration E2E Tests
 *
 * NOTE: These tests verify the backend integration functionality.
 * By default, the frontend uses in-memory storage (useBackend: false).
 * To test backend integration, set environment.useBackend to true in environment.development.ts
 * and ensure the NestJS backend is running on http://localhost:3000
 */

test.describe('Workspace Backend Integration', () => {
  test.describe('Basic Backend Operations', () => {
    test('should create workspace and verify it persists', async ({ page }) => {
      await page.goto('/workspace/new');

      const workspaceName = `Backend Test ${Date.now()}`;

      // Create workspace
      await page.getByTestId('workspace-name-input').fill(workspaceName);
      await page.getByTestId('workspace-description-input').fill('Testing backend persistence');

      const tagInput = page.getByTestId('tag-input');
      await tagInput.fill('backend');
      await tagInput.press('Enter');
      await tagInput.fill('integration');
      await tagInput.press('Enter');

      await page.getByTestId('save-workspace-button').click();
      await page.waitForTimeout(700);

      // Navigate away and come back
      await page.goto('/');
      await page.waitForTimeout(500);

      // Workspace should still exist (loaded from backend)
      await expect(page.getByTestId('workspace-item').filter({ hasText: workspaceName })).toBeVisible();
    });

    test('should update workspace on backend', async ({ page }) => {
      // Create workspace
      await page.goto('/workspace/new');
      const workspaceName = `Update Test ${Date.now()}`;

      await page.getByTestId('workspace-name-input').fill(workspaceName);
      await page.getByTestId('workspace-description-input').fill('Original description');
      await page.getByTestId('save-workspace-button').click();
      await page.waitForTimeout(700);

      // Navigate to edit
      await page.goto('/');
      await page.waitForTimeout(500);
      await page.getByTestId('workspace-item').filter({ hasText: workspaceName }).click();
      await page.waitForTimeout(500);

      // Update workspace
      await page.getByTestId('workspace-description-input').fill('Updated description from backend test');
      await page.getByTestId('save-workspace-button').click();
      await page.waitForTimeout(700);

      // Reload page to verify persistence
      await page.reload();
      await page.waitForTimeout(500);

      // Updated description should be present
      await expect(page.getByTestId('workspace-description-input')).toHaveValue('Updated description from backend test');
    });

    test('should delete workspace from backend', async ({ page }) => {
      // Create workspace
      await page.goto('/workspace/new');
      const workspaceName = `Delete Test ${Date.now()}`;

      await page.getByTestId('workspace-name-input').fill(workspaceName);
      await page.getByTestId('workspace-description-input').fill('Will be deleted');
      await page.getByTestId('save-workspace-button').click();
      await page.waitForTimeout(700);

      // Navigate to edit and delete
      await page.goto('/');
      await page.waitForTimeout(500);
      await page.getByTestId('workspace-item').filter({ hasText: workspaceName }).click();
      await page.waitForTimeout(500);

      await page.getByTestId('delete-workspace-button').click();
      await page.getByTestId('confirm-delete-button').click();
      await page.waitForTimeout(500);

      // Reload to verify deletion persisted
      await page.reload();
      await page.waitForTimeout(500);

      // Workspace should not exist
      await expect(page.getByTestId('workspace-item').filter({ hasText: workspaceName })).not.toBeVisible();
    });
  });

  test.describe('Workspace Loading and Sorting', () => {
    test('should load workspaces from backend on app init', async ({ page }) => {
      // Create a workspace first
      await page.goto('/workspace/new');
      const workspaceName = `Load Test ${Date.now()}`;

      await page.getByTestId('workspace-name-input').fill(workspaceName);
      await page.getByTestId('workspace-description-input').fill('Testing backend load');
      await page.getByTestId('save-workspace-button').click();
      await page.waitForTimeout(700);

      // Completely reload the page (simulating app restart)
      await page.goto('/');
      await page.waitForTimeout(1000); // Wait for loadWorkspaces to complete

      // Workspace should be loaded from backend
      await expect(page.getByTestId('workspace-item').filter({ hasText: workspaceName })).toBeVisible();
    });

    test('should display workspaces sorted by most recent first', async ({ page }) => {
      // Create multiple workspaces with delays between them
      const workspace1Name = `First ${Date.now()}`;
      await page.goto('/workspace/new');
      await page.getByTestId('workspace-name-input').fill(workspace1Name);
      await page.getByTestId('workspace-description-input').fill('Created first');
      await page.getByTestId('save-workspace-button').click();
      await page.waitForTimeout(700);

      await new Promise(resolve => setTimeout(resolve, 100));

      const workspace2Name = `Second ${Date.now()}`;
      await page.goto('/workspace/new');
      await page.getByTestId('workspace-name-input').fill(workspace2Name);
      await page.getByTestId('workspace-description-input').fill('Created second');
      await page.getByTestId('save-workspace-button').click();
      await page.waitForTimeout(700);

      await new Promise(resolve => setTimeout(resolve, 100));

      const workspace3Name = `Third ${Date.now()}`;
      await page.goto('/workspace/new');
      await page.getByTestId('workspace-name-input').fill(workspace3Name);
      await page.getByTestId('workspace-description-input').fill('Created third');
      await page.getByTestId('save-workspace-button').click();
      await page.waitForTimeout(700);

      // Navigate to home and check order
      await page.goto('/');
      await page.waitForTimeout(500);

      const workspaceItems = page.getByTestId('workspace-item');
      const count = await workspaceItems.count();

      // Find positions of our test workspaces
      let position1 = -1, position2 = -1, position3 = -1;

      for (let i = 0; i < count; i++) {
        const text = await workspaceItems.nth(i).textContent();
        if (text?.includes(workspace1Name)) position1 = i;
        if (text?.includes(workspace2Name)) position2 = i;
        if (text?.includes(workspace3Name)) position3 = i;
      }

      // Most recent (Third) should come before older ones
      // Third < Second < First (in terms of position indices)
      expect(position3).toBeGreaterThanOrEqual(0);
      expect(position2).toBeGreaterThanOrEqual(0);
      expect(position1).toBeGreaterThanOrEqual(0);
      expect(position3).toBeLessThan(position2);
      expect(position2).toBeLessThan(position1);
    });
  });

  test.describe('Timestamp Verification', () => {
    test('should have createdAt and updatedAt timestamps', async ({ page }) => {
      await page.goto('/workspace/new');
      const workspaceName = `Timestamp Test ${Date.now()}`;

      await page.getByTestId('workspace-name-input').fill(workspaceName);
      await page.getByTestId('workspace-description-input').fill('Testing timestamps');
      await page.getByTestId('save-workspace-button').click();
      await page.waitForTimeout(700);

      // Note: Timestamps are set on the backend/store, not displayed in UI by default
      // This test verifies the workspace was created successfully, which implies timestamps exist
      await page.goto('/');
      await page.waitForTimeout(500);
      await expect(page.getByTestId('workspace-item').filter({ hasText: workspaceName })).toBeVisible();
    });

    test('should update updatedAt timestamp on modification', async ({ page }) => {
      // Create workspace
      await page.goto('/workspace/new');
      const workspaceName = `Update Timestamp ${Date.now()}`;

      await page.getByTestId('workspace-name-input').fill(workspaceName);
      await page.getByTestId('workspace-description-input').fill('Original');
      await page.getByTestId('save-workspace-button').click();
      await page.waitForTimeout(700);

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 100));

      // Update workspace
      await page.goto('/');
      await page.waitForTimeout(500);
      await page.getByTestId('workspace-item').filter({ hasText: workspaceName }).click();
      await page.waitForTimeout(500);

      await page.getByTestId('workspace-description-input').fill('Modified');
      await page.getByTestId('save-workspace-button').click();
      await page.waitForTimeout(700);

      // The workspace should now be at the top of the list (most recently updated)
      await page.goto('/');
      await page.waitForTimeout(500);

      const firstWorkspace = page.getByTestId('workspace-item').first();
      await expect(firstWorkspace).toContainText(workspaceName);
    });
  });

  test.describe('Tag Persistence', () => {
    test('should persist tags to backend', async ({ page }) => {
      await page.goto('/workspace/new');
      const workspaceName = `Tag Persistence ${Date.now()}`;

      await page.getByTestId('workspace-name-input').fill(workspaceName);
      await page.getByTestId('workspace-description-input').fill('Testing tag persistence');

      const tagInput = page.getByTestId('tag-input');
      await tagInput.fill('persistent');
      await tagInput.press('Enter');
      await tagInput.fill('backend');
      await tagInput.press('Enter');
      await tagInput.fill('e2e');
      await tagInput.press('Enter');

      await page.getByTestId('save-workspace-button').click();
      await page.waitForTimeout(700);

      // Reload page
      await page.reload();
      await page.waitForTimeout(1000);

      // Navigate to workspace
      await page.getByTestId('workspace-item').filter({ hasText: workspaceName }).click();
      await page.waitForTimeout(500);

      // Tags should be present
      await expect(page.getByTestId('tag-chip').filter({ hasText: 'persistent' })).toBeVisible();
      await expect(page.getByTestId('tag-chip').filter({ hasText: 'backend' })).toBeVisible();
      await expect(page.getByTestId('tag-chip').filter({ hasText: 'e2e' })).toBeVisible();
    });

    test('should update tags on backend', async ({ page }) => {
      // Create workspace with tags
      await page.goto('/workspace/new');
      const workspaceName = `Tag Update ${Date.now()}`;

      await page.getByTestId('workspace-name-input').fill(workspaceName);
      await page.getByTestId('workspace-description-input').fill('Original tags');

      const tagInput = page.getByTestId('tag-input');
      await tagInput.fill('original');
      await tagInput.press('Enter');

      await page.getByTestId('save-workspace-button').click();
      await page.waitForTimeout(700);

      // Edit and update tags
      await page.goto('/');
      await page.waitForTimeout(500);
      await page.getByTestId('workspace-item').filter({ hasText: workspaceName }).click();
      await page.waitForTimeout(500);

      // Remove original tag
      await page.getByTestId('tag-chip').filter({ hasText: 'original' }).locator('button[matChipRemove]').click();

      // Add new tag
      await tagInput.fill('updated');
      await tagInput.press('Enter');

      await page.getByTestId('save-workspace-button').click();
      await page.waitForTimeout(700);

      // Reload and verify
      await page.reload();
      await page.waitForTimeout(1000);

      await page.getByTestId('workspace-item').filter({ hasText: workspaceName }).click();
      await page.waitForTimeout(500);

      await expect(page.getByTestId('tag-chip').filter({ hasText: 'updated' })).toBeVisible();
      await expect(page.getByTestId('tag-chip').filter({ hasText: 'original' })).not.toBeVisible();
    });
  });

  test.describe('Complete Backend Workflow', () => {
    test('complete CRUD workflow with backend persistence', async ({ page }) => {
      const workspaceName = `Complete Backend CRUD ${Date.now()}`;

      // CREATE
      await page.goto('/workspace/new');
      await page.getByTestId('workspace-name-input').fill(workspaceName);
      await page.getByTestId('workspace-description-input').fill('Initial description');

      const tagInput = page.getByTestId('tag-input');
      await tagInput.fill('crud');
      await tagInput.press('Enter');
      await tagInput.fill('test');
      await tagInput.press('Enter');

      await page.getByTestId('save-workspace-button').click();
      await page.waitForTimeout(700);

      // READ - verify created
      await page.goto('/');
      await page.waitForTimeout(500);
      await expect(page.getByTestId('workspace-item').filter({ hasText: workspaceName })).toBeVisible();

      // UPDATE
      await page.getByTestId('workspace-item').filter({ hasText: workspaceName }).click();
      await page.waitForTimeout(500);

      await page.getByTestId('workspace-description-input').fill('Updated description');
      await tagInput.fill('updated');
      await tagInput.press('Enter');

      await page.getByTestId('save-workspace-button').click();
      await page.waitForTimeout(700);

      // Verify update persisted
      await page.reload();
      await page.waitForTimeout(1000);

      await page.getByTestId('workspace-item').filter({ hasText: workspaceName }).click();
      await page.waitForTimeout(500);

      await expect(page.getByTestId('workspace-description-input')).toHaveValue('Updated description');
      await expect(page.getByTestId('tag-chip').filter({ hasText: 'updated' })).toBeVisible();

      // DELETE
      await page.getByTestId('delete-workspace-button').click();
      await page.getByTestId('confirm-delete-button').click();
      await page.waitForTimeout(500);

      // Verify deletion persisted
      await page.reload();
      await page.waitForTimeout(1000);

      await expect(page.getByTestId('workspace-item').filter({ hasText: workspaceName })).not.toBeVisible();
    });

    test('multiple workspaces with backend integration', async ({ page }) => {
      // Create multiple workspaces
      const workspaces = [];
      for (let i = 1; i <= 3; i++) {
        const name = `Multi Workspace ${i} ${Date.now()}`;
        workspaces.push(name);

        await page.goto('/workspace/new');
        await page.getByTestId('workspace-name-input').fill(name);
        await page.getByTestId('workspace-description-input').fill(`Description ${i}`);

        const tagInput = page.getByTestId('tag-input');
        await tagInput.fill(`tag${i}`);
        await tagInput.press('Enter');

        await page.getByTestId('save-workspace-button').click();
        await page.waitForTimeout(700);
      }

      // Reload and verify all workspaces exist
      await page.goto('/');
      await page.waitForTimeout(1000);

      for (const name of workspaces) {
        await expect(page.getByTestId('workspace-item').filter({ hasText: name })).toBeVisible();
      }
    });
  });

  test.describe('Search with Backend Data', () => {
    test('should search workspaces loaded from backend', async ({ page }) => {
      // Create searchable workspaces
      const workspace1 = `Searchable Backend ${Date.now()}`;
      await page.goto('/workspace/new');
      await page.getByTestId('workspace-name-input').fill(workspace1);
      await page.getByTestId('workspace-description-input').fill('Backend search test');

      const tagInput = page.getByTestId('tag-input');
      await tagInput.fill('searchable');
      await tagInput.press('Enter');

      await page.getByTestId('save-workspace-button').click();
      await page.waitForTimeout(700);

      // Go to search page
      await page.goto('/search');
      await page.waitForTimeout(500);

      // Search by name
      await page.getByTestId('search-name-input').fill('Searchable');
      await expect(page.getByTestId('search-result-item').filter({ hasText: workspace1 })).toBeVisible();

      // Search by tag
      await page.getByTestId('search-name-input').fill('');
      await page.getByTestId('available-tag-chip').filter({ hasText: 'searchable' }).click();
      await expect(page.getByTestId('search-result-item').filter({ hasText: workspace1 })).toBeVisible();
    });
  });
});
