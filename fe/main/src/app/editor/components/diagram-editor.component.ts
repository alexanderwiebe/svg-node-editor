import { Component, inject, signal, input, output, AfterViewInit } from '@angular/core';
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
import type { DiagramData } from '../../workspace/models/workspace.model';

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
          (selectionRemoved)="onSelectionRemoved($event)"
          (paletteItemDropped)="onDiagramChanged()"
          (edgeDrawn)="onDiagramChanged()"
          (nodeDragEnded)="onDiagramChanged()"
          (nodeResizeEnded)="onDiagramChanged()"
          (nodeRotateEnded)="onDiagramChanged()"
          (clipboardPasted)="onDiagramChanged()" />
      </div>

      <app-properties-panel
        [selectedNodes]="selectedNodes()"
        [selectedEdges]="selectedEdges()"
        (diagramChanged)="onDiagramChanged()" />
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
export class DiagramEditorComponent implements AfterViewInit {
  private modelService = inject(NgDiagramModelService);

  initialDiagram = input<DiagramData>({ nodes: [], edges: [] });
  diagramChanged = output<DiagramData>();

  selectedNodes = signal<Node[]>([]);
  selectedEdges = signal<Edge[]>([]);

  diagramModel = initializeModel({ nodes: [], edges: [] });

  readonly nodeTemplateMap = new NgDiagramNodeTemplateMap([
    ['default', DefaultNodeComponent],
    ['Rectangle', DefaultNodeComponent],
    ['Process', DefaultNodeComponent],
    ['Decision', DefaultNodeComponent],
  ]);

  // Guards onDiagramChanged from firing during initial seeding
  private watching = false;

  ngAfterViewInit() {
    const diagram = this.initialDiagram();
    if (diagram.nodes.length > 0 || diagram.edges.length > 0) {
      this.modelService.addNodes(diagram.nodes);
      this.modelService.addEdges(diagram.edges);
    }
    // Allow saves only after seeding is fully processed
    Promise.resolve().then(() => { this.watching = true; });
  }

  onSelectionChanged(event: SelectionChangedEvent) {
    this.selectedNodes.set(event.selectedNodes);
    this.selectedEdges.set(event.selectedEdges);
  }

  onSelectionRemoved(_event: SelectionRemovedEvent) {
    this.selectedNodes.set([]);
    this.selectedEdges.set([]);
  }

  onDiagramChanged() {
    console.log('[DiagramEditor] onDiagramChanged called, watching=', this.watching);
    if (!this.watching) return;
    const nodes = this.modelService.nodes();
    const edges = this.modelService.edges();
    console.log('[DiagramEditor] emitting diagramChanged, nodes=', nodes.length, 'edges=', edges.length);
    this.diagramChanged.emit({ nodes, edges });
  }
}
