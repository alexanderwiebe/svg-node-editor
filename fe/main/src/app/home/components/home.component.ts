import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { injectDispatch } from '@ngrx/signals/events';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HomeStore } from '../store/home.store';
import { homeEvents } from '../store/home.events';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="home-container">
      <mat-card class="getting-started-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>rocket_launch</mat-icon>
          <mat-card-title>Getting Started</mat-card-title>
          <mat-card-subtitle>Create your first workspace to get started</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>Workspaces help you organize your documents and projects. Start by creating your first workspace.</p>
        </mat-card-content>
        <mat-card-actions>
          <button
            mat-raised-button
            color="primary"
            (click)="createNewWorkspace()"
            data-testid="create-workspace-button">
            <mat-icon>add</mat-icon>
            Create New Workspace
          </button>
        </mat-card-actions>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-icon mat-card-avatar>description</mat-icon>
          <mat-card-title>Welcome to AI Document</mat-card-title>
          <mat-card-subtitle>Angular Material is ready</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          @if (store.hasMessage()) {
            <p data-testid="api-response">API Response: {{ store.displayMessage() }}</p>
          }
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="testApi()" [disabled]="store.loading()">
            @if (store.loading()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              <ng-container>
                <mat-icon>send</mat-icon>
                Test API
              </ng-container>
            }
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: `
    .home-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    mat-card {
      max-width: 100%;
    }

    .getting-started-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .getting-started-card mat-card-title,
    .getting-started-card mat-card-subtitle,
    .getting-started-card mat-card-content p {
      color: white;
    }

    mat-card-actions {
      padding: 16px;
    }

    button mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }

    button mat-icon {
      margin-right: 8px;
    }
  `
})
export class HomeComponent {
  private readonly dispatch = injectDispatch(homeEvents);
  private readonly router = inject(Router);
  readonly store = inject(HomeStore);

  testApi() {
    this.dispatch.loadMessage();
  }

  createNewWorkspace() {
    this.router.navigate(['/workspace/new']);
  }
}
