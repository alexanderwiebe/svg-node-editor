export class Workspace {
  id: string;
  name: string;
  tags: string[];
  description: string;
  diagram: {
    nodes: Record<string, unknown>[];
    edges: Record<string, unknown>[];
  };
  createdAt: Date;
  updatedAt: Date;
}
