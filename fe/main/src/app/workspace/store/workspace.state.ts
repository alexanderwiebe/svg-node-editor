import { Workspace } from '../models/workspace.model';

export interface WorkspaceState {
  workspaces: Workspace[];
  loading: boolean;
  error: string | null;
}

export const initialWorkspaceState: WorkspaceState = {
  workspaces: [],
  loading: false,
  error: null
};
