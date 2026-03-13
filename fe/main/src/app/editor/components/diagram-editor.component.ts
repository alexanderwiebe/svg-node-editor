import { Component, inject, signal } from '@angular/core';
import {
  NgDiagramComponent,
  NgDiagramModelService,
  NgDiagramNodeTemplateMap,
  initializeModel,
  provideNgDiagram,
} from 'ng-diagram';
import type { SelectionChangedEvent, SelectionRemovedEvent, Node, Edge } from 'ng-diagram';
import { NodePaletteComponent } from './node-palette.component';
import { PropertiesPanelComponent } from './properties-panel.component';
import { DefaultNodeComponent } from './default-node.component';

@Component({
  selector: 'app-diagram-editor',
  standalone: true,
  imports: [NgDiagramComponent, NodePaletteComponent, PropertiesPanelComponent],
  providers: [provideNgDiagram()],
  template: `
    <div class="editor-shell">
      <app-node-palette />

      <div class="canvas-wrapper">
        <ng-diagram
          [model]="diagramModel"
          [nodeTemplateMap]="nodeTemplateMap"
          (selectionChanged)="onSelectionChanged($event)"
          (selectionRemoved)="onSelectionRemoved($event)" />
      </div>

      <app-properties-panel
        [selectedNodes]="selectedNodes()"
        [selectedEdges]="selectedEdges()" />
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex: 1;
      min-height: 0;
    }

    .editor-shell {
      display: flex;
      flex-direction: row;
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }

    .canvas-wrapper {
      flex: 1;
      min-width: 0;
      display: flex;
      position: relative;
    }

    .canvas-wrapper ng-diagram {
      flex: 1;
      width: 100%;
      height: 100%;
    }
  `
})
export class DiagramEditorComponent {
  private modelService = inject(NgDiagramModelService);

  selectedNodes = signal<Node[]>([]);
  selectedEdges = signal<Edge[]>([]);

  diagramModel = initializeModel({ nodes: [], edges: [] });

  readonly nodeTemplateMap = new NgDiagramNodeTemplateMap([
    ['default', DefaultNodeComponent],
    ['Rectangle', DefaultNodeComponent],
    ['Process', DefaultNodeComponent],
    ['Decision', DefaultNodeComponent],
  ]);

  onSelectionChanged(event: SelectionChangedEvent) {
    this.selectedNodes.set(event.selectedNodes);
    this.selectedEdges.set(event.selectedEdges);
  }

  onSelectionRemoved(_event: SelectionRemovedEvent) {
    this.selectedNodes.set([]);
    this.selectedEdges.set([]);
  }
}
