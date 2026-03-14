import type { APIRequestContext } from '@playwright/test';

export async function cleanupAllWorkspaces(request: APIRequestContext): Promise<void> {
  const response = await request.get('http://localhost:3000/workspaces');
  if (response.ok()) {
    const workspaces = await response.json();
    // Skip "Persistence Test" workspaces — those are owned and cleaned up by diagram-persistence.spec.ts,
    // which runs serially. Deleting them here would cause cross-file interference.
    const toDelete = workspaces.filter((ws: { id: string; name: string }) => !ws.name.startsWith('Persistence Test'));
    await Promise.all(toDelete.map((ws: { id: string }) =>
      request.delete(`http://localhost:3000/workspaces/${ws.id}`)
    ));
  }
}
