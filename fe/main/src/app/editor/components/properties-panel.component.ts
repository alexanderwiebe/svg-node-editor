import { Component, input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgDiagramModelService } from 'ng-diagram';
import type { Node, Edge } from 'ng-diagram';

@Component({
  selector: 'app-properties-panel',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatIconModule],
  template: `
    <div class="panel" [class.visible]="selectedNodes().length > 0 || selectedEdges().length > 0" data-testid="properties-panel">
      @if (selectedNodes().length === 1) {
        @let node = selectedNodes()[0];
        <div class="panel-header">
          <mat-icon>settings</mat-icon>
          <span>Node Properties</span>
        </div>
        <div class="panel-body">
          <label class="field-label">Label</label>
          <input
            class="field-input"
            type="text"
            [value]="getNodeProp(node, 'label')"
            (input)="updateNodeLabel(node, $event)"
            data-testid="node-label-input"
            placeholder="Node label" />

          <label class="field-label">Fill Color</label>
          <input
            class="color-input"
            type="color"
            [value]="getNodeProp(node, 'fill') || '#4a90d9'"
            (input)="updateNodeFill(node, $event)"
            data-testid="node-fill-input" />

          <label class="field-label">Border Color</label>
          <input
            class="color-input"
            type="color"
            [value]="getNodeProp(node, 'stroke') || '#2c6aa0'"
            (input)="updateNodeStroke(node, $event)"
            data-testid="node-stroke-input" />

          <label class="field-label">Width</label>
          <input
            class="field-input"
            type="number"
            [value]="node.size?.width || 120"
            (change)="updateNodeSize(node, 'width', $event)"
            data-testid="node-width-input"
            min="40" />

          <label class="field-label">Height</label>
          <input
            class="field-input"
            type="number"
            [value]="node.size?.height || 60"
            (change)="updateNodeSize(node, 'height', $event)"
            data-testid="node-height-input"
            min="30" />

          <button
            mat-raised-button
            color="warn"
            class="delete-btn"
            (click)="deleteNode(node)"
            data-testid="delete-node-button">
            <mat-icon>delete</mat-icon>
            Delete Node
          </button>
        </div>
      } @else if (selectedEdges().length === 1) {
        @let edge = selectedEdges()[0];
        <div class="panel-header">
          <mat-icon>settings</mat-icon>
          <span>Edge Properties</span>
        </div>
        <div class="panel-body">
          <label class="field-label">Label</label>
          <input
            class="field-input"
            type="text"
            [value]="getEdgeProp(edge, 'label')"
            (input)="updateEdgeLabel(edge, $event)"
            data-testid="edge-label-input"
            placeholder="Edge label" />

          <label class="field-label">Color</label>
          <input
            class="color-input"
            type="color"
            [value]="getEdgeProp(edge, 'color') || '#666666'"
            (input)="updateEdgeColor(edge, $event)"
            data-testid="edge-color-input" />

          <button
            mat-raised-button
            color="warn"
            class="delete-btn"
            (click)="deleteEdge(edge)"
            data-testid="delete-edge-button">
            <mat-icon>delete</mat-icon>
            Delete Edge
          </button>
        </div>
      } @else if (selectedNodes().length === 0 && selectedEdges().length === 0) {
        <div class="panel-empty">
          <mat-icon>info</mat-icon>
          <p>Select a node or edge to edit its properties</p>
        </div>
      }
    </div>
  `,
  styles: `
    .panel {
      width: 280px;
      flex-shrink: 0;
      background: #fafafa;
      border-left: 1px solid #e0e0e0;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.2s ease;
      overflow: hidden;
    }

    .panel.visible {
      transform: translateX(0);
    }

    .panel-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-bottom: 1px solid #e0e0e0;
      background: white;
      font-weight: 500;
      font-size: 14px;
    }

    .panel-body {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 16px;
      overflow-y: auto;
      flex: 1;
    }

    .field-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      color: #666;
      letter-spacing: 0.4px;
    }

    .field-input {
      width: 100%;
      padding: 8px 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 13px;
      font-family: inherit;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.15s;
    }

    .field-input:focus {
      border-color: #1976d2;
    }

    .color-input {
      width: 100%;
      height: 36px;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 2px;
      cursor: pointer;
    }

    .delete-btn {
      margin-top: 8px;
    }

    .panel-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      flex: 1;
      color: #999;
      text-align: center;
      padding: 24px;
    }

    .panel-empty mat-icon {
      font-size: 32px;
      opacity: 0.4;
    }

    .panel-empty p {
      margin: 0;
      font-size: 13px;
      line-height: 1.5;
    }
  `
})
export class PropertiesPanelComponent {
  selectedNodes = input<Node[]>([]);
  selectedEdges = input<Edge[]>([]);

  private modelService = inject(NgDiagramModelService);

  getNodeProp(node: Node, key: string): unknown {
    return (node.data as Record<string, unknown>)[key] ?? '';
  }

  getEdgeProp(edge: Edge, key: string): unknown {
    return (edge.data as Record<string, unknown>)[key] ?? '';
  }

  updateNodeLabel(node: Node, event: Event) {
    const label = (event.target as HTMLInputElement).value;
    this.modelService.updateNodeData(node.id, { ...(node.data as Record<string, unknown>), label });
  }

  updateNodeFill(node: Node, event: Event) {
    const fill = (event.target as HTMLInputElement).value;
    this.modelService.updateNodeData(node.id, { ...(node.data as Record<string, unknown>), fill });
  }

  updateNodeStroke(node: Node, event: Event) {
    const stroke = (event.target as HTMLInputElement).value;
    this.modelService.updateNodeData(node.id, { ...(node.data as Record<string, unknown>), stroke });
  }

  updateNodeSize(node: Node, dimension: 'width' | 'height', event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(value) && value > 0) {
      const currentSize = node.size ?? { width: 120, height: 60 };
      this.modelService.updateNode(node.id, {
        size: { ...currentSize, [dimension]: value }
      });
    }
  }

  deleteNode(node: Node) {
    this.modelService.deleteNodes([node.id]);
  }

  updateEdgeLabel(edge: Edge, event: Event) {
    const label = (event.target as HTMLInputElement).value;
    this.modelService.updateEdgeData(edge.id, { ...(edge.data as Record<string, unknown>), label });
  }

  updateEdgeColor(edge: Edge, event: Event) {
    const color = (event.target as HTMLInputElement).value;
    this.modelService.updateEdgeData(edge.id, { ...(edge.data as Record<string, unknown>), color });
  }

  deleteEdge(edge: Edge) {
    this.modelService.deleteEdges([edge.id]);
  }
}
