# TASKS — SVG Node Editor

## 1. SVG Design Surface

> Status: In Progress

Full-viewport SVG element rendered on the workspace page, serving as the canvas for all visual editing.

### Subtasks

- [ ] **1.1** Add an `<svg>` element to the workspace component that fills the available viewport (below any top nav/toolbar)
- [ ] **1.2** Set up a coordinate system with a root `<g>` transform group for pan/zoom (all nodes/edges render inside this group)
- [ ] **1.3** Apply CSS to remove scrollbars and prevent default browser drag/select behavior on the SVG
- [ ] **1.4** Create an Angular component (`SvgCanvasComponent`) that owns the SVG element and exposes the transform group
- [ ] **1.5** Add the canvas component to the workspace route/page layout

### Acceptance Criteria

- Workspace page shows a blank SVG canvas filling the viewport below any chrome
- No scrollbars; the SVG scales with window resize
- A root `<g>` group exists and is accessible for pan/zoom transforms

---

## 2. Viewport Controls

Pan, zoom, and fit-to-view so the user can navigate a large graph.

### Subtasks

- [ ] **2.1** Implement **pan**: on mousedown on empty canvas → track mousemove → translate the root `<g>` group; stop on mouseup
- [ ] **2.2** Implement **zoom**: on wheel event → scale the root `<g>` group around the cursor point; clamp scale to a min/max range (e.g., 0.1–5)
- [ ] **2.3** Store `panX`, `panY`, `zoom` in the workspace signal store state
- [ ] **2.4** Add a **fit-to-view** action: compute the bounding box of all nodes, calculate the transform that fits them in the viewport with padding, animate the transition
- [ ] **2.5** Add toolbar buttons for zoom-in, zoom-out, and fit-to-view
- [ ] **2.6** Show current zoom percentage in the toolbar or status area

### Acceptance Criteria

- Click-drag on empty space pans the canvas
- Scroll wheel zooms in/out centered on the cursor
- Fit-to-view frames all nodes with padding
- Zoom level is displayed and persists in store state

---

## 3. Node Creation

Users can add rectangular nodes to the canvas via a toolbar action.

### Subtasks

- [ ] **3.1** Define the `GraphNode` model: `{ id, x, y, width, height, label, fill, stroke }`
- [ ] **3.2** Add a `nodes` array to the workspace signal store state
- [ ] **3.3** Create store events: `NodeEvents.add`, `NodeEvents.remove`, `NodeEvents.update`
- [ ] **3.4** Create reducers that handle add/remove/update for nodes
- [ ] **3.5** Add an "Add Node" button in the toolbar that dispatches `NodeEvents.add` with a default position (center of current viewport)
- [ ] **3.6** Create `SvgNodeComponent` that renders a `<g>` containing a `<rect>` for each node, positioned at `(x, y)` with `width`/`height`
- [ ] **3.7** Render all nodes from the store inside the canvas root `<g>` group

### Acceptance Criteria

- Clicking "Add Node" creates a new rectangle on the canvas at the viewport center
- Node appears with default size (e.g., 160×80) and default styling
- Multiple nodes can be added and all render correctly

---

## 4. Node Labels

Each node displays a centered text label that can be edited inline.

### Subtasks

- [ ] **4.1** Add a `<text>` element inside each node's `<g>`, centered horizontally and vertically within the `<rect>`
- [ ] **4.2** Default label is "Node N" (where N is a sequential counter)
- [ ] **4.3** On double-click of the label, switch to an inline editing mode: overlay an `<foreignObject>` with an `<input>` pre-filled with the current label
- [ ] **4.4** On Enter or blur of the input, dispatch `NodeEvents.update` with the new label and remove the input overlay
- [ ] **4.5** On Escape, cancel editing and restore the original label
- [ ] **4.6** Apply text styling: white text on dark nodes, dark text on light nodes (contrast-aware)

### Acceptance Criteria

- Every node displays its label centered inside the rectangle
- Double-clicking the label opens an inline text input
- Pressing Enter or clicking away saves the new label
- Pressing Escape cancels the edit

---

## 5. Node Dragging

Users can reposition nodes by clicking and dragging them.

### Subtasks

- [ ] **5.1** On mousedown on a node `<rect>` or `<g>`, begin drag: record the offset between the cursor and the node's `(x, y)`
- [ ] **5.2** On mousemove (while dragging), update the node's `x`/`y` in the store, accounting for current pan/zoom transform
- [ ] **5.3** On mouseup, finalize the position and stop tracking
- [ ] **5.4** Change the cursor to `grab`/`grabbing` during hover/drag
- [ ] **5.5** Ensure dragging a node does NOT trigger canvas pan (stop event propagation)
- [ ] **5.6** Connected edges update in real-time as the node moves (dependent on task 6)

### Acceptance Criteria

- Click-drag on a node moves it smoothly
- Node position updates in the store
- Dragging a node does not pan the canvas
- Cursor changes to grabbing while dragging

---

## 6. Edge Creation

Connector circles on node borders allow the user to draw edges between nodes.

### Subtasks

- [ ] **6.1** Define the `GraphEdge` model: `{ id, sourceNodeId, sourcePort, targetNodeId, targetPort, label, color, thickness }`
- [ ] **6.2** Add an `edges` array to the workspace signal store state
- [ ] **6.3** Create store events: `EdgeEvents.add`, `EdgeEvents.remove`, `EdgeEvents.update`
- [ ] **6.4** Create reducers for add/remove/update edges
- [ ] **6.5** Render 4 connector circles (top, right, bottom, left) on each node border; show on hover, always show when dragging a new edge
- [ ] **6.6** On mousedown on a connector circle, begin edge creation: render a temporary `<line>` or `<path>` from the source connector to the cursor
- [ ] **6.7** On mouseup over another node's connector, dispatch `EdgeEvents.add` linking the two nodes
- [ ] **6.8** On mouseup over empty space, cancel the edge creation and remove the temporary line
- [ ] **6.9** Create `SvgEdgeComponent` that renders a `<line>` or `<path>` between the source and target connector positions
- [ ] **6.10** Edges re-route when nodes move (recalculate connector positions from node `x, y, width, height`)

### Acceptance Criteria

- Hovering a node reveals connector circles on its borders
- Dragging from a connector shows a temporary edge following the cursor
- Dropping on another connector creates a permanent edge
- Dropping on empty space cancels
- Edges visually connect the correct ports and update when nodes move

---

## 7. Data Model (Dual Save)

Graph structure (nodes + edges) stored separately from visual layout (positions, viewport state, colors). Both persisted to the backend.

### Subtasks

- [ ] **7.1** Define backend models/DTOs:
  - `GraphData`: `{ nodes: GraphNode[], edges: GraphEdge[] }` — the logical graph
  - `LayoutData`: `{ nodePositions: Record<nodeId, {x, y, width, height}>, viewport: {panX, panY, zoom}, nodeStyles: Record<nodeId, {fill, stroke}>, edgeStyles: Record<edgeId, {color, thickness}> }` — the visual layout
- [ ] **7.2** Add API endpoints: `PUT /workspaces/:id/graph` and `PUT /workspaces/:id/layout`
- [ ] **7.3** Add API endpoints: `GET /workspaces/:id/graph` and `GET /workspaces/:id/layout`
- [ ] **7.4** Add store effects: on node/edge changes, debounce and auto-save graph data to the backend
- [ ] **7.5** Add store effects: on position/viewport/style changes, debounce and auto-save layout data to the backend
- [ ] **7.6** On workspace load, fetch both graph and layout, merge into store state
- [ ] **7.7** Add a visual save-status indicator (e.g., "Saving…" / "Saved" / "Error")

### Acceptance Criteria

- Graph structure and layout are saved as separate payloads
- Changes auto-save after a debounce period
- Reloading the page restores all nodes, edges, positions, and styles
- Save status is visible to the user

---

## 8. Node Styling

Users can change the fill and stroke color of individual nodes.

### Subtasks

- [ ] **8.1** Add a context menu or selection-based toolbar that appears when a node is selected (single-click to select)
- [ ] **8.2** Add a color picker (for fill) in the node toolbar — can use a simple palette of preset colors or `<input type="color">`
- [ ] **8.3** Add a stroke color picker in the node toolbar
- [ ] **8.4** On color change, dispatch `NodeEvents.update` with the new `fill`/`stroke`
- [ ] **8.5** Selected node shows a visual indicator (e.g., dashed border, selection handles)
- [ ] **8.6** Clicking empty canvas deselects the current node

### Acceptance Criteria

- Clicking a node selects it with a visual indicator
- Selected node shows fill and stroke color pickers
- Changing colors updates the node immediately
- Clicking empty space deselects

---

## 9. Edge Styling

Users can customize edge appearance: labels, thickness, and color.

### Subtasks

- [ ] **9.1** Add a `<text>` label at the midpoint of each edge, pulled from `edge.label`
- [ ] **9.2** Double-click an edge label to edit inline (similar to node label editing — `<foreignObject>` with `<input>`)
- [ ] **9.3** Add a context menu or selection toolbar when an edge is clicked
- [ ] **9.4** Add thickness control (e.g., thin/medium/thick presets or a slider)
- [ ] **9.5** Add color picker for edge stroke color
- [ ] **9.6** On changes, dispatch `EdgeEvents.update`
- [ ] **9.7** Add a delete option for edges in the context menu

### Acceptance Criteria

- Edges display their label at the midpoint
- Double-clicking an edge label allows inline editing
- Selecting an edge shows thickness and color controls
- Edge appearance updates immediately on changes
- Edges can be deleted

---

## 10. Node Detail Panel

Double-clicking a node opens a slide-in panel on the right side for detailed editing.

### Subtasks

- [ ] **10.1** Create `NodeDetailPanelComponent` — a fixed-position panel that slides in from the right
- [ ] **10.2** On double-click of a node (not the label), set `selectedNodeId` in the store and open the panel
- [ ] **10.3** Panel displays: label (editable input), fill color, stroke color, width, height, x/y position
- [ ] **10.4** All fields in the panel dispatch `NodeEvents.update` on change
- [ ] **10.5** Panel has a close button and closes on Escape
- [ ] **10.6** Panel shows connected edges (list of edges where this node is source or target) with links to select those edges
- [ ] **10.7** Add a "Delete Node" button in the panel that dispatches `NodeEvents.remove` (also removes connected edges)
- [ ] **10.8** Animate panel open/close with a CSS transition

### Acceptance Criteria

- Double-clicking a node opens the detail panel from the right
- Panel shows all node properties and allows editing
- Changes in the panel update the node on the canvas in real-time
- Connected edges are listed
- Node can be deleted from the panel
- Panel can be closed with the X button or Escape key
