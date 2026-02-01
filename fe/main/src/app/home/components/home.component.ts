import { Component, inject } from '@angular/core';
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
  `,
  styles: `
    mat-card {
      max-width: 400px;
      margin: 2rem auto;
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
  readonly store = inject(HomeStore);

  testApi() {
    this.dispatch.loadMessage();
  }
}
