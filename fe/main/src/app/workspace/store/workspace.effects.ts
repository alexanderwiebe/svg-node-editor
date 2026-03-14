import { inject } from '@angular/core';
import { Events } from '@ngrx/signals/events';
import { map, delay, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { mapResponse } from '@ngrx/operators';
import { workspaceEvents } from './workspace.events';
import { Workspace } from '../models/workspace.model';

export function createWorkspaceEffects(store: any) {
  const events = inject(Events);

  return {
    saveWorkspace$: events.on(workspaceEvents.saveWorkspace).pipe(
      switchMap(({ payload }) =>
        of(payload).pipe(
          delay(500), // Simulate API call
          map((data) => {
            // Simulate backend creating the workspace
            const workspace: Workspace = {
              id: crypto.randomUUID(),
              name: data.name,
              tags: data.tags,
              description: data.description,
              diagram: { nodes: [], edges: [] },
              createdAt: new Date(),
              updatedAt: new Date()
            };
            return workspace;
          }),
          mapResponse({
            next: (workspace) => workspaceEvents.workspaceSaved({ workspace }),
            error: (error: Error) => workspaceEvents.workspaceSaveFailed({
              error: error.message || 'Failed to save workspace'
            })
          })
        )
      )
    ),
    workspaceSaved$: events.on(workspaceEvents.workspaceSaved).pipe(
      switchMap(({ payload }) =>
        of(null).pipe(
          map(() => {
            store.addWorkspace(payload.workspace);
            return workspaceEvents.workspaceSaved({ workspace: payload.workspace });
          })
        )
      )
    )
  };
}
