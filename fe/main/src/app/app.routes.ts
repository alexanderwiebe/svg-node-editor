import { Routes } from '@angular/router';
import { HomeComponent } from './home/components/home.component';
import { WorkspacePageComponent } from './workspace/components/workspace-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'workspace/new',
    component: WorkspacePageComponent
  },
  {
    path: 'workspace/:id',
    component: WorkspacePageComponent
  }
];
