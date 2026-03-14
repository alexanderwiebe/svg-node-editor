import type { Node, Edge } from 'ng-diagram';

export interface DiagramData {
  nodes: Node[];
  edges: Edge[];
}

export const EMPTY_DIAGRAM: DiagramData = { nodes: [], edges: [] };

export interface Workspace {
  id: string;
  name: string;
  tags: string[];
  description: string;
  diagram: DiagramData;
  createdAt: Date;
  updatedAt: Date;
}
