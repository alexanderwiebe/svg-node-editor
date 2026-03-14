import { Injectable } from '@nestjs/common';
import { Workspace } from './entities/workspace.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class WorkspaceDataService {
  private workspaces: Map<string, Workspace> = new Map();

  create(workspaceData: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt' | 'diagram'> & { diagram?: { nodes: Record<string, unknown>[]; edges: Record<string, unknown>[] } }): Workspace {
    const workspace: Workspace = {
      id: randomUUID(),
      ...workspaceData,
      diagram: workspaceData.diagram ?? { nodes: [], edges: [] },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.workspaces.set(workspace.id, workspace);
    return workspace;
  }

  findAll(): Workspace[] {
    return Array.from(this.workspaces.values())
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  findOne(id: string): Workspace | undefined {
    return this.workspaces.get(id);
  }

  update(id: string, workspaceData: Partial<Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>>): Workspace | undefined {
    const workspace = this.workspaces.get(id);
    if (!workspace) {
      return undefined;
    }

    const updatedWorkspace: Workspace = {
      ...workspace,
      ...workspaceData,
      updatedAt: new Date(),
    };
    this.workspaces.set(id, updatedWorkspace);
    return updatedWorkspace;
  }

  remove(id: string): boolean {
    return this.workspaces.delete(id);
  }

  clear(): void {
    this.workspaces.clear();
  }

  count(): number {
    return this.workspaces.size;
  }
}
