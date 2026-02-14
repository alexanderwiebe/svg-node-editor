import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutComponent } from './core/components/layout.component';
import { WorkspaceStore } from './workspace/store/workspace.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LayoutComponent],
  template: `
    <app-layout>
      <router-outlet />
    </app-layout>
  `
})
export class AppComponent implements OnInit {
  private workspaceStore = inject(WorkspaceStore);

  ngOnInit() {
    // Load workspaces from backend on app initialization
    this.workspaceStore.loadWorkspaces();
  }
}
