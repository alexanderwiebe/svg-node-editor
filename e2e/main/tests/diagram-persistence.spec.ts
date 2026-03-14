import { test, expect } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, '../../../pr-screenshots');

async function createWorkspaceAndNavigate(page: import('@playwright/test').Page): Promise<string> {
  await page.goto('/workspace/new');
  await page.getByTestId('workspace-name-input').fill(`Persistence Test ${Date.now()}`);
  await page.getByTestId('workspace-description-input-form').fill('Test workspace for persistence');
  await page.getByTestId('save-workspace-button').click();
  // Wait for navigation to the workspace edit URL — must NOT be /workspace/new since that's where we started.
  // Angular's saveWorkspace fires a setTimeout(navigate, 600) so the URL changes ~600ms after the HTTP response.
  await page.waitForURL(url => url.href.includes('/workspace/') && !url.href.endsWith('/workspace/new'), { timeout: 5000 });
  return page.url();
}

async function dragPaletteItemToCanvas(
  page: import('@playwright/test').Page,
  paletteTestId: string,
  targetFraction = { x: 0.5, y: 0.5 }
) {
  const paletteItem = page.getByTestId(paletteTestId);
  const canvas = page.locator('.canvas-wrapper');

  await paletteItem.waitFor({ state: 'visible' });
  const canvasBox = await canvas.boundingBox();
  if (!canvasBox) throw new Error('Canvas not found');

  await paletteItem.dragTo(canvas, {
    targetPosition: {
      x: canvasBox.width * targetFraction.x,
      y: canvasBox.height * targetFraction.y,
    },
  });
}

// Serial to prevent parallel afterEach cleanup from deleting workspaces mid-test
test.describe.serial('Diagram Persistence', () => {
  let createdWorkspaceId: string | null = null;

  test.afterEach(async ({ request }) => {
    if (createdWorkspaceId) {
      await request.delete(`http://localhost:3000/workspaces/${createdWorkspaceId}`);
      createdWorkspaceId = null;
    }
  });

  test('should save diagram data to backend after node drop', async ({ page, request }) => {
    const workspaceUrl = await createWorkspaceAndNavigate(page);
    const workspaceId = workspaceUrl.split('/').pop()!;
    createdWorkspaceId = workspaceId;

    await dragPaletteItemToCanvas(page, 'palette-item-Rectangle', { x: 0.5, y: 0.5 });
    await expect(page.getByTestId('diagram-node')).toHaveCount(1, { timeout: 5000 });

    // Wait for debounce + HTTP save to complete
    await page.waitForTimeout(1000);

    // Verify data was actually saved to backend
    const response = await request.get(`http://localhost:3000/workspaces/${workspaceId}`);
    expect(response.ok()).toBeTruthy();
    const workspace = await response.json();
    expect(workspace.diagram.nodes).toHaveLength(1);
  });

  test('should persist nodes after full page reload', async ({ page, request }) => {
    const workspaceUrl = await createWorkspaceAndNavigate(page);
    const workspaceId = workspaceUrl.split('/').pop()!;
    createdWorkspaceId = workspaceId;

    await dragPaletteItemToCanvas(page, 'palette-item-Rectangle', { x: 0.5, y: 0.5 });
    await expect(page.getByTestId('diagram-node')).toHaveCount(1, { timeout: 5000 });

    // Wait for debounce + HTTP save to complete
    await page.waitForTimeout(1000);

    // Confirm saved to backend before reloading
    const saved = await request.get(`http://localhost:3000/workspaces/${workspaceId}`);
    const savedData = await saved.json();
    expect(savedData.diagram.nodes).toHaveLength(1);

    // Full page reload
    await page.goto(workspaceUrl);
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('diagram-node')).toHaveCount(1, { timeout: 10000 });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09-node-persisted-after-reload.png') });
  });

  test('should persist edge after full page reload', async ({ page, request }) => {
    const workspaceUrl = await createWorkspaceAndNavigate(page);
    const workspaceId = workspaceUrl.split('/').pop()!;
    createdWorkspaceId = workspaceId;

    await dragPaletteItemToCanvas(page, 'palette-item-Rectangle', { x: 0.25, y: 0.5 });
    await dragPaletteItemToCanvas(page, 'palette-item-Rectangle', { x: 0.75, y: 0.5 });
    await expect(page.getByTestId('diagram-node')).toHaveCount(2, { timeout: 5000 });

    // Connect the two nodes
    const nodes = page.getByTestId('diagram-node');
    const node1 = nodes.first();
    const node2 = nodes.last();

    await node1.hover();
    const portRight = node1.locator('ng-diagram-port').nth(1);
    const portLeft = node2.locator('ng-diagram-port').nth(3);
    await portRight.dragTo(portLeft);

    await expect(page.locator('[class*="edge"], path[class*="ng-diagram"]').first()).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10-edge-drawn.png') });

    // Wait for debounce + HTTP save to complete
    await page.waitForTimeout(1000);

    // Confirm saved to backend
    const saved = await request.get(`http://localhost:3000/workspaces/${workspaceId}`);
    const savedData = await saved.json();
    expect(savedData.diagram.nodes).toHaveLength(2);
    expect(savedData.diagram.edges).toHaveLength(1);

    // Full page reload
    await page.goto(workspaceUrl);
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('diagram-node')).toHaveCount(2, { timeout: 10000 });
    await expect(page.locator('[class*="edge"], path[class*="ng-diagram"]').first()).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '11-edge-persisted-after-reload.png') });
  });

  test('should persist edge when navigating away immediately via SPA navigation', async ({ page, request }) => {
    const workspaceUrl = await createWorkspaceAndNavigate(page);
    createdWorkspaceId = workspaceUrl.split('/').pop()!;

    await dragPaletteItemToCanvas(page, 'palette-item-Rectangle', { x: 0.25, y: 0.5 });
    await dragPaletteItemToCanvas(page, 'palette-item-Rectangle', { x: 0.75, y: 0.5 });
    await expect(page.getByTestId('diagram-node')).toHaveCount(2, { timeout: 5000 });

    // Wait for nodes to be saved (debounce)
    await page.waitForTimeout(700);

    // Connect the nodes
    const nodes = page.getByTestId('diagram-node');
    const node1 = nodes.first();
    const node2 = nodes.last();

    await node1.hover();
    const portRight = node1.locator('ng-diagram-port').nth(1);
    const portLeft = node2.locator('ng-diagram-port').nth(3);
    await portRight.dragTo(portLeft);

    // Verify edge exists in UI
    await expect(page.locator('[class*="edge"], path[class*="ng-diagram"]').first()).toBeVisible({ timeout: 5000 });

    // Navigate away immediately via Angular router (SPA, no full reload)
    // This simulates the user clicking to another workspace before the 500ms debounce fires.
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate back - page.goto on same origin triggers Angular SPA navigation
    await page.goto(workspaceUrl);
    await page.waitForLoadState('networkidle');

    // Both nodes and the edge should be present
    await expect(page.getByTestId('diagram-node')).toHaveCount(2, { timeout: 10000 });
    await expect(page.locator('[class*="edge"], path[class*="ng-diagram"]').first()).toBeVisible({ timeout: 5000 });
  });
});
