import { test, expect } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { cleanupAllWorkspaces } from './test-helpers';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, '../../../pr-screenshots');

async function createWorkspaceAndNavigate(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/workspace/new');
  await page.getByTestId('workspace-name-input').fill('Diagram Test Workspace');
  await page.getByTestId('workspace-description-input-form').fill('Test workspace for diagram editor');
  await page.getByTestId('save-workspace-button').click();
  await page.waitForURL(/\/workspace\/.+/);
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

test.describe('Diagram Editor', () => {
  test.beforeEach(async ({ page }) => {
    await createWorkspaceAndNavigate(page);
  });

  test.afterEach(async ({ request }) => {
    await cleanupAllWorkspaces(request);
  });

  test('should show the palette and empty canvas', async ({ page }) => {
    await expect(page.getByTestId('palette-item-Rectangle')).toBeVisible();
    await expect(page.getByTestId('palette-item-Process')).toBeVisible();
    await expect(page.getByTestId('palette-item-Decision')).toBeVisible();

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-empty-canvas.png') });
  });

  test('should drag a node from palette onto canvas', async ({ page }) => {
    await dragPaletteItemToCanvas(page, 'palette-item-Rectangle');

    await expect(page.getByTestId('diagram-node').first()).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-node-dropped.png') });
  });

  test('should show properties panel when node is selected', async ({ page }) => {
    await dragPaletteItemToCanvas(page, 'palette-item-Rectangle');

    const node = page.getByTestId('diagram-node').first();
    await expect(node).toBeVisible({ timeout: 5000 });

    await node.click();

    const panel = page.getByTestId('properties-panel');
    await expect(panel).toBeVisible({ timeout: 3000 });
    await expect(page.getByTestId('node-label-input')).toBeVisible();

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-properties-panel.png') });
  });

  test('should edit node label from properties panel', async ({ page }) => {
    await dragPaletteItemToCanvas(page, 'palette-item-Rectangle');

    const node = page.getByTestId('diagram-node').first();
    await expect(node).toBeVisible({ timeout: 5000 });
    await node.click();

    const labelInput = page.getByTestId('node-label-input');
    await expect(labelInput).toBeVisible({ timeout: 3000 });
    await labelInput.fill('My Custom Node');

    await expect(node.locator('.node-label')).toHaveText('My Custom Node', { timeout: 3000 });

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-label-edited.png') });
  });

  test('should delete node from properties panel', async ({ page }) => {
    await dragPaletteItemToCanvas(page, 'palette-item-Rectangle');

    const node = page.getByTestId('diagram-node').first();
    await expect(node).toBeVisible({ timeout: 5000 });
    await node.click();

    const deleteButton = page.getByTestId('delete-node-button');
    await expect(deleteButton).toBeVisible({ timeout: 3000 });

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-before-delete.png') });

    await deleteButton.click();

    await expect(page.getByTestId('diagram-node')).toHaveCount(0, { timeout: 3000 });

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06-after-delete.png') });
  });

  test('should connect two nodes by dragging between ports', async ({ page }) => {
    await dragPaletteItemToCanvas(page, 'palette-item-Rectangle', { x: 0.25, y: 0.5 });
    await dragPaletteItemToCanvas(page, 'palette-item-Rectangle', { x: 0.75, y: 0.5 });

    await expect(page.getByTestId('diagram-node')).toHaveCount(2, { timeout: 5000 });

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07-two-nodes.png') });

    const nodes = page.getByTestId('diagram-node');
    const node1 = nodes.first();
    const node2 = nodes.last();

    await node1.hover();

    const portRight = node1.locator('ng-diagram-port').nth(1);
    const portLeft = node2.locator('ng-diagram-port').nth(3);

    await portRight.dragTo(portLeft);

    const edgeCount = await page.locator('[class*="edge"], path[class*="ng-diagram"]').count();
    expect(edgeCount).toBeGreaterThan(0);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08-nodes-connected.png') });
  });
});
