import { computed, Signal } from '@angular/core';
import { Workspace } from '../models/workspace.model';

export function selectAllWorkspaces(workspaces: Signal<Workspace[]>): Signal<Workspace[]> {
  return computed(() => workspaces());
}

export function selectWorkspacesCount(workspaces: Signal<Workspace[]>): Signal<number> {
  return computed(() => workspaces().length);
}
