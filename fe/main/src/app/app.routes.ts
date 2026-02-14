import { Routes } from '@angular/router';
import { HomeComponent } from './home/components/home.component';
import { WorkspacePageComponent } from './workspace/components/workspace-page.component';
import { SearchPageComponent } from './search/components/search-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'search',
    component: SearchPageComponent
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
