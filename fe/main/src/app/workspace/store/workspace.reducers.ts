import { on } from '@ngrx/signals/events';
import { workspaceEvents } from './workspace.events';

export const workspaceReducers = [
  on(workspaceEvents.saveWorkspace, () => ({
    loading: true,
    error: null
  })),
  on(workspaceEvents.workspaceSaveFailed, ({ payload }) => ({
    loading: false,
    error: payload.error
  }))
];
