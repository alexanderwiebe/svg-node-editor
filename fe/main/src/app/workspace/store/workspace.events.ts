import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';
import { Workspace } from '../models/workspace.model';

export const workspaceEvents = eventGroup({
  source: 'Workspace',
  events: {
    saveWorkspace: type<{ name: string; tags: string[]; description: string }>(),
    workspaceSaved: type<{ workspace: Workspace }>(),
    workspaceSaveFailed: type<{ error: string }>()
  }
});
