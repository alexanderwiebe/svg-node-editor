import { inject } from '@angular/core';
import { signalStore, withComputed, withState, withMethods, patchState } from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { initialWorkspaceState } from './workspace.state';
import { selectAllWorkspaces, selectWorkspacesCount } from './workspace.selectors';
import { Workspace } from '../models/workspace.model';
import { WorkspaceApiService } from '../services/workspace-api.service';
import { firstValueFrom } from 'rxjs';

export const WorkspaceStore = signalStore(
  { providedIn: 'root' },
  withDevtools('workspace'),
  withState(initialWorkspaceState),
  withComputed((store) => ({
    allWorkspaces: selectAllWorkspaces(store.workspaces),
    workspacesCount: selectWorkspacesCount(store.workspaces)
  })),
  withMethods((store, apiService = inject(WorkspaceApiService)) => ({
    getWorkspaceById(id: string): Workspace | undefined {
      return store.workspaces().find(ws => ws.id === id);
    },

    async loadWorkspaces(): Promise<void> {
      if (!apiService.isBackendEnabled()) {
        console.log('Backend disabled, skipping load');
        return;
      }

      patchState(store, { loading: true, error: null });

      try {
        const workspaces = await firstValueFrom(apiService.findAll());
        patchState(store, {
          workspaces,
          loading: false,
          error: null
        });
        console.log('Workspaces loaded from backend:', workspaces.length);
      } catch (error: any) {
        patchState(store, {
          loading: false,
          error: error.message || 'Failed to load workspaces'
        });
        console.error('Failed to load workspaces:', error);
      }
    },

    async saveWorkspace(data: { name: string; tags: string[]; description: string }): Promise<Workspace> {
      patchState(store, { loading: true, error: null });

      if (apiService.isBackendEnabled()) {
        // Use backend API
        try {
          const workspace = await firstValueFrom(apiService.create(data));

          // Optimistically update local state
          patchState(store, (state) => ({
            workspaces: [...state.workspaces, workspace],
            loading: false,
            error: null
          }));

          console.log('Workspace saved to backend:', workspace);
          return workspace;
        } catch (error: any) {
          patchState(store, {
            loading: false,
            error: error.message || 'Failed to save workspace'
          });
          throw error;
        }
      } else {
        // Use local in-memory storage
        return new Promise((resolve, reject) => {
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

              console.log('Workspace saved locally:', workspace);
              resolve(workspace);
            } catch (error: any) {
              patchState(store, {
                loading: false,
                error: error.message || 'Failed to save workspace'
              });
              reject(error);
            }
          }, 500);
        });
      }
    },

    async updateWorkspace(id: string, data: { name: string; tags: string[]; description: string }): Promise<void> {
      patchState(store, { loading: true, error: null });

      if (apiService.isBackendEnabled()) {
        // Use backend API
        try {
          const updatedWorkspace = await firstValueFrom(apiService.update(id, data));

          // Update local state
          patchState(store, (state) => ({
            workspaces: state.workspaces.map(ws =>
              ws.id === id ? updatedWorkspace : ws
            ),
            loading: false,
            error: null
          }));

          console.log('Workspace updated on backend:', id);
        } catch (error: any) {
          patchState(store, {
            loading: false,
            error: error.message || 'Failed to update workspace'
          });
          throw error;
        }
      } else {
        // Use local in-memory storage
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            try {
              patchState(store, (state) => ({
                workspaces: state.workspaces.map(ws =>
                  ws.id === id
                    ? { ...ws, ...data, updatedAt: new Date() }
                    : ws
                ),
                loading: false,
                error: null
              }));

              console.log('Workspace updated locally:', id);
              resolve();
            } catch (error: any) {
              patchState(store, {
                loading: false,
                error: error.message || 'Failed to update workspace'
              });
              reject(error);
            }
          }, 500);
        });
      }
    },

    async deleteWorkspace(id: string): Promise<void> {
      patchState(store, { loading: true, error: null });

      if (apiService.isBackendEnabled()) {
        // Use backend API
        try {
          await firstValueFrom(apiService.remove(id));

          // Update local state
          patchState(store, (state) => ({
            workspaces: state.workspaces.filter(ws => ws.id !== id),
            loading: false,
            error: null
          }));

          console.log('Workspace deleted from backend:', id);
        } catch (error: any) {
          patchState(store, {
            loading: false,
            error: error.message || 'Failed to delete workspace'
          });
          throw error;
        }
      } else {
        // Use local in-memory storage
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            try {
              patchState(store, (state) => ({
                workspaces: state.workspaces.filter(ws => ws.id !== id),
                loading: false,
                error: null
              }));

              console.log('Workspace deleted locally:', id);
              resolve();
            } catch (error: any) {
              patchState(store, {
                loading: false,
                error: error.message || 'Failed to delete workspace'
              });
              reject(error);
            }
          }, 300);
        });
      }
    }
  }))
);
