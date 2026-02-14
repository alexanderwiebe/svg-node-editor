import { Component, inject, effect, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { MatButtonModule } from '@angular/material/button';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { WorkspaceStore } from '../../workspace/store/workspace.store';

interface NavNode {
  name: string;
  icon?: string;
  route?: string;
  children?: NavNode[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    MatListModule,
    MatIconModule,
    MatTreeModule,
    MatButtonModule,
    RouterLink,
    RouterLinkActive
  ],
  template: `
    <mat-nav-list>
      <a mat-list-item routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
        <mat-icon matListItemIcon>home</mat-icon>
        <span matListItemTitle>Home</span>
      </a>
      <a mat-list-item routerLink="/search" routerLinkActive="active" data-testid="search-nav-link">
        <mat-icon matListItemIcon>search</mat-icon>
        <span matListItemTitle>Search</span>
      </a>
    </mat-nav-list>

    <mat-tree [dataSource]="dataSource" [treeControl]="treeControl" class="workspace-tree">
      <mat-nested-tree-node *matTreeNodeDef="let node; when: hasChild">
        <div class="mat-tree-node">
          @if (node.children && node.children.length > 0) {
            <button mat-icon-button matTreeNodeToggle [attr.aria-label]="'Toggle ' + node.name" [attr.data-testid]="'toggle-' + node.name.toLowerCase()">
              <mat-icon class="mat-icon-rtl-mirror">
                {{treeControl.isExpanded(node) ? 'expand_more' : 'chevron_right'}}
              </mat-icon>
            </button>
          } @else {
            <span class="tree-spacer"></span>
          }
          <button mat-button class="tree-node" (click)="navigateToNode(node)" [attr.data-testid]="node.name === 'Workspaces' ? 'workspaces-section' : 'workspace-item'">
            <mat-icon class="tree-icon">{{ node.icon || 'folder' }}</mat-icon>
            {{ node.name }}
          </button>
        </div>
        <div [class.tree-invisible]="!treeControl.isExpanded(node)" role="group">
          <ng-container matTreeNodeOutlet></ng-container>
        </div>
      </mat-nested-tree-node>
    </mat-tree>
  `,
  styles: `
    .active {
      background: rgba(0, 0, 0, 0.04);
    }

    .workspace-tree {
      margin-top: 1rem;
    }

    .tree-node {
      text-align: left;
      width: 100%;
      padding-left: 0;
      justify-content: flex-start;
    }

    .tree-icon {
      margin-right: 8px;
      vertical-align: middle;
    }

    .tree-invisible {
      display: none;
    }

    mat-nested-tree-node {
      padding-left: 0;
    }

    /* Remove default Material tree padding */
    ::ng-deep .mat-nested-tree-node > div {
      padding-left: 0 !important;
    }

    .mat-tree-node {
      display: flex;
      align-items: center;
      min-height: 48px;
      padding-left: 0;
    }

    /* Compact toggle button */
    .mat-tree-node button[mat-icon-button] {
      width: 36px;
      height: 36px;
      padding: 0;
      margin-right: 4px;
    }

    /* Align child workspace items with parent Workspaces icon */
    .tree-spacer {
      width: 40px;
      display: inline-block;
      flex-shrink: 0;
    }

    /* Reduce indent for child nodes - align icons */
    mat-nested-tree-node mat-nested-tree-node {
      margin-left: 0;
    }

    /* Make all icons align vertically */
    mat-nested-tree-node mat-nested-tree-node .mat-tree-node {
      padding-left: 40px;
    }
  `
})
export class SidebarComponent {
  private readonly router = inject(Router);
  readonly workspaceStore = inject(WorkspaceStore);

  treeControl = new NestedTreeControl<NavNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<NavNode>();

  // Computed tree data that updates automatically
  private treeData = computed(() => {
    const workspaces = this.workspaceStore.workspaces();
    const workspaceChildren: NavNode[] = workspaces.map(ws => ({
      name: ws.name,
      icon: 'work',
      route: `/workspace/${ws.id}`,
      children: [] // Empty children array to make it a nested node
    }));

    return [
      {
        name: 'Workspaces',
        icon: 'folder_special',
        route: '/workspace/new',
        children: workspaceChildren
      }
    ];
  });

  constructor() {
    // React to tree data changes
    effect(() => {
      const newData = this.treeData();
      console.log('Sidebar effect running, tree data:', newData);
      console.log('Workspaces in tree:', newData[0]?.children?.length || 0);
      this.dataSource.data = newData;

      // Expand workspaces section by default
      setTimeout(() => {
        const workspacesNode = this.dataSource.data.find(node => node.name === 'Workspaces');
        if (workspacesNode && workspacesNode.children && workspacesNode.children.length > 0) {
          console.log('Expanding workspaces section');
          this.treeControl.expand(workspacesNode);
        }
      }, 0);
    });
  }

  hasChild = (_: number, node: NavNode) => node.children !== undefined;

  navigateToNode(node: NavNode) {
    if (node.route) {
      this.router.navigate([node.route]);
    }
  }
}
