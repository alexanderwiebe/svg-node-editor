import { Component, input, computed } from '@angular/core';
import { NgDiagramPortComponent, NgDiagramNodeTemplate } from 'ng-diagram';
import type { Node } from 'ng-diagram';

@Component({
  selector: 'app-default-node',
  standalone: true,
  imports: [NgDiagramPortComponent],
  template: `
    <div class="node-wrapper" [style.background-color]="nodeData()['fill'] || '#4a90d9'" [style.border-color]="nodeData()['stroke'] || '#2c6aa0'" data-testid="diagram-node">
      <ng-diagram-port id="port-top" type="both" side="top" />
      <ng-diagram-port id="port-right" type="both" side="right" />
      <ng-diagram-port id="port-bottom" type="both" side="bottom" />
      <ng-diagram-port id="port-left" type="both" side="left" />
      <span class="node-label">{{ nodeData()['label'] || 'Node' }}</span>
    </div>
  `,
  styles: `
    :host {
      display: block;
      position: relative;
    }

    .node-wrapper {
      position: relative;
      min-width: 120px;
      min-height: 60px;
      border: 2px solid #2c6aa0;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: move;
      user-select: none;
    }

    .node-label {
      color: white;
      font-size: 13px;
      font-weight: 500;
      text-align: center;
      padding: 0 8px;
    }
  `
})
export class DefaultNodeComponent implements NgDiagramNodeTemplate {
  node = input.required<Node>();
  nodeData = computed(() => this.node().data as Record<string, unknown>);
}
