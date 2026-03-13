import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgDiagramPaletteItemComponent, NgDiagramPaletteItem, BasePaletteItemData } from 'ng-diagram';

interface NodeData extends BasePaletteItemData {
  fill: string;
  stroke: string;
}

interface PaletteEntry {
  item: NgDiagramPaletteItem;
  icon: string;
}

@Component({
  selector: 'app-node-palette',
  standalone: true,
  imports: [MatIconModule, NgDiagramPaletteItemComponent],
  template: `
    <div class="palette">
      <div class="palette-title">Nodes</div>
      @for (entry of paletteEntries; track entry.item.type) {
        <ng-diagram-palette-item [item]="entry.item" [attr.data-testid]="'palette-item-' + entry.item.type">
          <div class="palette-chip">
            <mat-icon class="palette-icon">{{ entry.icon }}</mat-icon>
            <span class="palette-label">{{ $any(entry.item.data).label }}</span>
          </div>
        </ng-diagram-palette-item>
      }
    </div>
  `,
  styles: `
    .palette {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px 8px;
      background: #f5f5f5;
      border-right: 1px solid #e0e0e0;
      width: 160px;
      flex-shrink: 0;
      overflow-y: auto;
    }

    .palette-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      color: #666;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
      padding: 0 4px;
    }

    ng-diagram-palette-item {
      display: block;
    }

    .palette-chip {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 10px 8px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 6px;
      cursor: grab;
      transition: all 0.15s;
      user-select: none;
    }

    .palette-chip:hover {
      background: #e3f2fd;
      border-color: #1976d2;
    }

    .palette-icon {
      font-size: 24px;
      color: #555;
    }

    .palette-label {
      font-size: 11px;
      color: #444;
      text-align: center;
    }
  `
})
export class NodePaletteComponent {
  readonly paletteEntries: PaletteEntry[] = [
    {
      item: { type: 'Rectangle', data: { label: 'Rectangle', fill: '#4a90d9', stroke: '#2c6aa0' } as NodeData },
      icon: 'crop_square',
    },
    {
      item: { type: 'Process', data: { label: 'Process', fill: '#5cb85c', stroke: '#3d8b3d' } as NodeData },
      icon: 'stop',
    },
    {
      item: { type: 'Decision', data: { label: 'Decision', fill: '#f0ad4e', stroke: '#c87d0e' } as NodeData },
      icon: 'change_history',
    },
  ];
}
