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

test.describe('Workspace Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.afterEach(async ({ request }) => {
    await cleanupAllWorkspaces(request);
  });

  test('should display getting started pane on home page', async ({ page }) => {
    // Check for getting started card
    await expect(page.locator('.getting-started-card')).toBeVisible();
    await expect(page.locator('.getting-started-card')).toContainText('Getting Started');
    await expect(page.locator('.getting-started-card')).toContainText('Create your first workspace');
  });

  test('should navigate to new workspace page from home page button', async ({ page }) => {
    // Click the "Create New Workspace" button on home page
    await page.getByTestId('create-workspace-button').click();

    // Verify navigation to workspace page
    await expect(page).toHaveURL('/workspace/new');
    await expect(page.locator('h1')).toHaveText('New Workspace');
  });

  test('should display workspaces section in left navigation', async ({ page }) => {
    // Check for Workspaces section in sidebar
    await expect(page.getByTestId('workspaces-section')).toBeVisible();
  });

  test('should navigate to new workspace page from left nav workspaces button', async ({ page }) => {
    // Click on the Workspaces section (the text, not the expand button)
    const workspacesSection = page.getByTestId('workspaces-section');
    await workspacesSection.click();

    // There might be two click targets - the toggle and the button
    // Try clicking the button next to the toggle
    await page.getByRole('button', { name: /Workspaces/i }).last().click();

    // Verify navigation to workspace page
    await expect(page).toHaveURL('/workspace/new');
  });

  test('should display workspace form with three inputs', async ({ page }) => {
    // Navigate to workspace page
    await page.goto('/workspace/new');

    // Verify all three inputs are present
    await expect(page.getByTestId('workspace-name-input')).toBeVisible();
    await expect(page.getByTestId('workspace-tags-input')).toBeVisible();
    await expect(page.getByTestId('workspace-description-input')).toBeVisible();

    // Verify save button is present
    await expect(page.getByTestId('save-workspace-button')).toBeVisible();
  });

  test('should have save button disabled when form is invalid', async ({ page }) => {
    await page.goto('/workspace/new');

    // Save button should be disabled when form is empty
    const saveButton = page.getByTestId('save-workspace-button');
    await expect(saveButton).toBeDisabled();
  });

  test('should enable save button when form is valid', async ({ page }) => {
    await page.goto('/workspace/new');

    // Fill out the form
    await page.getByTestId('workspace-name-input').fill('Test Workspace');
    await page.getByTestId('workspace-description-input').fill('This is a test workspace');

    // Save button should now be enabled
    const saveButton = page.getByTestId('save-workspace-button');
    await expect(saveButton).toBeEnabled();
  });

  test('should create workspace and display it in left navigation', async ({ page }) => {
    // Navigate to workspace page
    await page.goto('/workspace/new');

    // Fill out the workspace form
    const workspaceName = `Test Workspace ${Date.now()}`;
    await page.getByTestId('workspace-name-input').fill(workspaceName);
    await page.getByTestId('workspace-tags-input').fill('test, e2e, automation');
    await page.getByTestId('workspace-description-input').fill('E2E test workspace description');

    // Click save button
    await page.getByTestId('save-workspace-button').click();

    // Wait for the save operation to complete (simulated delay is 500ms)
    await page.waitForTimeout(600);

    // Navigate back to home using router (not page reload)
    await page.click('a[routerlink="/"]');
    await page.waitForTimeout(1000);

    // Verify the workspace appears in the left nav
    await expect(page.getByTestId('workspace-item').filter({ hasText: workspaceName })).toBeVisible({ timeout: 5000 });
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/workspace/new');

    // Try to submit without filling the form
    const nameInput = page.getByTestId('workspace-name-input');
    const descriptionInput = page.getByTestId('workspace-description-input');

    // Touch the fields to trigger validation
    await nameInput.click();
    await descriptionInput.click();
    await nameInput.click();

    // Check for validation errors (Angular Material shows errors when touched and invalid)
    await expect(page.locator('mat-error').filter({ hasText: 'required' })).toHaveCount(2);
  });

  test('should clear form after successful save', async ({ page }) => {
    await page.goto('/workspace/new');

    // Fill out and save
    await page.getByTestId('workspace-name-input').fill('Temp Workspace');
    await page.getByTestId('workspace-tags-input').fill('temp');
    await page.getByTestId('workspace-description-input').fill('Temporary workspace');
    await page.getByTestId('save-workspace-button').click();

    // Wait for save to complete
    await page.waitForTimeout(600);

    // Form should be cleared
    await expect(page.getByTestId('workspace-name-input')).toHaveValue('');
    await expect(page.getByTestId('workspace-tags-input')).toHaveValue('');
    await expect(page.getByTestId('workspace-description-input')).toHaveValue('');
  });

  test('complete workflow: create workspace from home and verify in nav', async ({ page }) => {
    // Start on home page
    await page.goto('/');

    // Click "Create New Workspace" from getting started pane
    await page.getByTestId('create-workspace-button').click();

    // Verify we're on the workspace page
    await expect(page).toHaveURL('/workspace/new');

    // Create a unique workspace name
    const workspaceName = `E2E Workspace ${Date.now()}`;

    // Fill out the complete form
    await page.getByTestId('workspace-name-input').fill(workspaceName);
    await page.getByTestId('workspace-tags-input').fill('e2e, complete, workflow');
    await page.getByTestId('workspace-description-input').fill('Complete end-to-end test workspace');

    // Save the workspace
    await page.getByTestId('save-workspace-button').click();

    // Wait for save operation
    await page.waitForTimeout(600);

    // Navigate back to home using router (not page reload)
    await page.click('a[routerlink="/"]');
    await page.waitForTimeout(1000);

    // Verify the workspace is visible in the left nav
    const workspaceItem = page.getByTestId('workspace-item').filter({ hasText: workspaceName });
    await expect(workspaceItem).toBeVisible({ timeout: 5000 });

    // Verify the workspace name is correct
    await expect(workspaceItem).toContainText(workspaceName);
  });

  test('should not show delete button in create mode', async ({ page }) => {
    await page.goto('/workspace/new');

    // Delete button should not exist in create mode
    await expect(page.getByTestId('delete-workspace-button')).not.toBeVisible();
  });

  test('should show delete button in edit mode', async ({ page }) => {
    // Create a workspace first
    await page.goto('/workspace/new');
    await page.getByTestId('workspace-name-input').fill('Test Delete Workspace');
    await page.getByTestId('workspace-description-input').fill('To be deleted');
    await page.getByTestId('save-workspace-button').click();
    await page.waitForTimeout(700);

    // Navigate home and click on the workspace
    await page.click('a[routerlink="/"]');
    await page.waitForTimeout(500);

    // Click on the workspace to edit it
    await page.getByTestId('workspace-item').filter({ hasText: 'Test Delete Workspace' }).click();
    await page.waitForTimeout(500);

    // Delete button should be visible in edit mode
    await expect(page.getByTestId('delete-workspace-button')).toBeVisible();
  });

  test('should show confirmation dialog when delete is clicked', async ({ page }) => {
    // Create a workspace
    await page.goto('/workspace/new');
    const workspaceName = 'Confirm Dialog Test';
    await page.getByTestId('workspace-name-input').fill(workspaceName);
    await page.getByTestId('workspace-description-input').fill('Testing dialog');
    await page.getByTestId('save-workspace-button').click();
    await page.waitForTimeout(700);

    // Navigate to edit mode
    await page.click('a[routerlink="/"]');
    await page.waitForTimeout(500);
    await page.getByTestId('workspace-item').filter({ hasText: workspaceName }).click();
    await page.waitForTimeout(500);

    // Click delete button
    await page.getByTestId('delete-workspace-button').click();

    // Confirmation dialog should appear
    await expect(page.getByRole('heading', { name: /delete workspace/i })).toBeVisible();
    await expect(page.locator('mat-dialog-content')).toContainText(workspaceName);
    await expect(page.locator('mat-dialog-content')).toContainText('This action cannot be undone');
  });

  test('should cancel deletion when cancel button is clicked', async ({ page }) => {
    // Create a workspace
    await page.goto('/workspace/new');
    const workspaceName = 'Cancel Delete Test';
    await page.getByTestId('workspace-name-input').fill(workspaceName);
    await page.getByTestId('workspace-description-input').fill('Should not be deleted');
    await page.getByTestId('save-workspace-button').click();
    await page.waitForTimeout(700);

    // Navigate to edit mode
    await page.click('a[routerlink="/"]');
    await page.waitForTimeout(500);
    await page.getByTestId('workspace-item').filter({ hasText: workspaceName }).click();
    await page.waitForTimeout(500);

    // Click delete and then cancel
    await page.getByTestId('delete-workspace-button').click();
    await page.getByTestId('cancel-delete-button').click();

    // Should still be on edit page
    await expect(page.locator('h1')).toHaveText('Edit Workspace');

    // Workspace should still exist in nav
    await page.click('a[routerlink="/"]');
    await page.waitForTimeout(500);
    await expect(page.getByTestId('workspace-item').filter({ hasText: workspaceName })).toBeVisible();
  });

  test('should delete workspace when confirmed', async ({ page }) => {
    // Create a workspace
    await page.goto('/workspace/new');
    const workspaceName = `Delete Me ${Date.now()}`;
    await page.getByTestId('workspace-name-input').fill(workspaceName);
    await page.getByTestId('workspace-description-input').fill('Will be deleted');
    await page.getByTestId('save-workspace-button').click();
    await page.waitForTimeout(700);

    // Navigate to edit mode
    await page.click('a[routerlink="/"]');
    await page.waitForTimeout(500);
    await page.getByTestId('workspace-item').filter({ hasText: workspaceName }).click();
    await page.waitForTimeout(500);

    // Click delete and confirm
    await page.getByTestId('delete-workspace-button').click();
    await page.getByTestId('confirm-delete-button').click();

    // Wait for deletion and navigation
    await page.waitForTimeout(500);

    // Should be redirected to home
    await expect(page).toHaveURL('/');

    // Workspace should no longer exist in nav
    await expect(page.getByTestId('workspace-item').filter({ hasText: workspaceName })).not.toBeVisible();
  });

  test('complete delete workflow: create, edit, delete with confirmation', async ({ page }) => {
    const workspaceName = `Full Delete Flow ${Date.now()}`;

    // Create workspace
    await page.goto('/workspace/new');
    await page.getByTestId('workspace-name-input').fill(workspaceName);
    await page.getByTestId('workspace-tags-input').fill('delete, test, e2e');
    await page.getByTestId('workspace-description-input').fill('Complete delete workflow test');
    await page.getByTestId('save-workspace-button').click();
    await page.waitForTimeout(700);

    // Verify created
    await page.click('a[routerlink="/"]');
    await page.waitForTimeout(500);
    await expect(page.getByTestId('workspace-item').filter({ hasText: workspaceName })).toBeVisible();

    // Edit workspace
    await page.getByTestId('workspace-item').filter({ hasText: workspaceName }).click();
    await page.waitForTimeout(500);

    // Verify in edit mode
    await expect(page.locator('h1')).toHaveText('Edit Workspace');
    await expect(page.getByTestId('delete-workspace-button')).toBeVisible();
    await expect(page.getByTestId('workspace-name-input')).toHaveValue(workspaceName);

    // Delete with confirmation
    await page.getByTestId('delete-workspace-button').click();

    // Verify dialog
    await expect(page.getByRole('heading', { name: /delete workspace/i })).toBeVisible();
    await expect(page.locator('mat-dialog-content')).toContainText(workspaceName);

    // Confirm deletion
    await page.getByTestId('confirm-delete-button').click();
    await page.waitForTimeout(500);

    // Verify deletion and navigation
    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('workspace-item').filter({ hasText: workspaceName })).not.toBeVisible();
  });
});
