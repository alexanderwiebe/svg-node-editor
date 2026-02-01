import { Component, inject } from '@angular/core';
import { injectDispatch } from '@ngrx/signals/events';
import { HomeStore } from '../store/home.store';
import { homeEvents } from '../store/home.events';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <h1>Welcome to AI Document</h1>
    <button (click)="testApi()" [disabled]="store.loading()">
      {{ store.loading() ? 'Loading...' : 'Test API' }}
    </button>
    @if (store.hasMessage()) {
      <p data-testid="api-response">API Response: {{ store.displayMessage() }}</p>
    }
  `,
  styles: ``
})
export class HomeComponent {
  private readonly dispatch = injectDispatch(homeEvents);
  readonly store = inject(HomeStore);

  testApi() {
    this.dispatch.loadMessage();
  }
}
