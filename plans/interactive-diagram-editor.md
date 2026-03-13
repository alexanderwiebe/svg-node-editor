# Plan: Interactive Diagram Editor

## Context

The workspace page has a basic ng-diagram integration showing two static sample nodes. The goal is to build a fully interactive diagram editor with:
- A node palette sidebar for dragging node types onto the canvas
- Built-in edge creation by connecting ports (ng-diagram handles this natively)
- A properties panel that opens when a node or edge is selected
- No minimap

The `ng-diagram` v1.1.1 library already handles node dragging, edge drawing (fires `EdgeDrawnEvent`), and selection (`SelectionChangedEvent`). The key additions are the palette drag-to-canvas and properties panel.

---

## Architecture

3-column layout inside the existing workspace edit view:

```
┌────────────┬──────────────────────────┬─────────────────┐
│   Palette  │      ng-diagram canvas   │  Properties     │
│  (160px)   │      (flex: 1)           │  (280px)        │
│            │                          │  (hidden if     │
│ [Rect]     │  ← pan/zoom/drag nodes   │   nothing       │
│ [Process]  │  ← draw edges via ports  │   selected)     │
│ [Decision] │                          │                 │
└────────────┴──────────────────────────┴─────────────────┘
```

### Key Implementation Note

ng-diagram's `PaletteDropDirective` is a host directive on `<ng-diagram>` that intercepts **all** drag/drop events on the canvas. It uses an internal data transfer format set by `NgDiagramPaletteItemComponent`. Custom HTML5 drag-drop (using `dataTransfer.setData('nodeType', ...)`) is not recognized by this directive — it creates nodes with `data: undefined`, causing `TypeError: Cannot use 'in' operator to search for 'label' in undefined`.

**Fix**: Use ng-diagram's `NgDiagramPaletteItemComponent` for palette items. The directive and component share a `PaletteService` (provided by `provideNgDiagram()`) to coordinate drag data in the correct internal format. Nodes are created automatically at the drop position.

---

## Files Created / Modified

### New files
| File | Purpose |
|------|---------|
| `fe/main/src/app/editor/components/diagram-editor.component.ts` | Main 3-column shell; wires events from ng-diagram |
| `fe/main/src/app/editor/components/default-node.component.ts` | Custom node template with ports and label |
| `fe/main/src/app/editor/components/node-palette.component.ts` | Left sidebar using `NgDiagramPaletteItemComponent` |
| `fe/main/src/app/editor/components/properties-panel.component.ts` | Right panel; form bound to selected node/edge |
| `e2e/main/tests/diagram-editor.spec.ts` | Playwright tests with screenshot capture |

### Modified files
| File | Change |
|------|--------|
| `fe/main/src/app/workspace/components/workspace-page.component.ts` | Replace `<ng-diagram>` with `<app-diagram-editor>`, remove `provideNgDiagram()` |
| `e2e/main/playwright.config.ts` | Enable `screenshot: 'on'`, `video: 'retain-on-failure'` |
| `CLAUDE.md` | Add plan/prompt persistence and PR process |

---

## Key APIs Used

| API | Purpose |
|-----|---------|
| `NgDiagramPaletteItemComponent` | Palette items with correct internal drag format |
| `NgDiagramModelService.updateNodeData()` | Update node label/fill/stroke in properties panel |
| `NgDiagramModelService.updateNode()` | Update node size |
| `NgDiagramModelService.deleteNodes()` | Delete node + connected edges |
| `NgDiagramModelService.updateEdgeData()` | Update edge label/color |
| `NgDiagramModelService.deleteEdges()` | Delete edge |
| `NgDiagramNodeTemplateMap` | Map node types to `DefaultNodeComponent` |
| `NgDiagramPortComponent` | Four ports (top/right/bottom/left) per node, type `both` |
| `(selectionChanged)` | Drive properties panel from ng-diagram |
| `provideNgDiagram()` | In `DiagramEditorComponent` providers |

---

## Data Type Notes

- `Node.data` is typed as `DataObject = object`. Cast to `Record<string, unknown>` to read dynamic properties (`fill`, `stroke`, `label`).
- `Edge` has no `style` property. Store color in `edge.data` instead.
- `NgDiagramPaletteItem` defaults to `BasePaletteItemData = { label: string }`. Extended with `{ fill: string, stroke: string }` using `as NodeData`.
