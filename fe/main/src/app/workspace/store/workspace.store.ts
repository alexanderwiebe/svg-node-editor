import { signalStore, withComputed, withState, withMethods, patchState } from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { initialWorkspaceState } from './workspace.state';
import { selectAllWorkspaces, selectWorkspacesCount } from './workspace.selectors';
import { Workspace } from '../models/workspace.model';

export const WorkspaceStore = signalStore(
  { providedIn: 'root' },
  withDevtools('workspace'),
  withState(initialWorkspaceState),
  withComputed((store) => ({
    allWorkspaces: selectAllWorkspaces(store.workspaces),
    workspacesCount: selectWorkspacesCount(store.workspaces)
  })),
  withMethods((store) => ({
    saveWorkspace(data: { name: string; tags: string[]; description: string }) {
      patchState(store, { loading: true, error: null });

      // Simulate async API call
      setTimeout(() => {
        try {
          const workspace: Workspace = {
            id: crypto.randomUUID(),
            name: data.name,
            tags: data.tags,
            description: data.description,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          patchState(store, (state) => ({
            workspaces: [...state.workspaces, workspace],
            loading: false,
            error: null
          }));

          console.log('Workspace saved:', workspace);
          console.log('Total workspaces:', store.workspaces().length);
        } catch (error: any) {
          patchState(store, {
            loading: false,
            error: error.message || 'Failed to save workspace'
          });
        }
      }, 500);
    }
  }))
);
