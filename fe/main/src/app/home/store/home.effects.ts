import { inject } from '@angular/core';
import { switchMap } from 'rxjs';
import { mapResponse } from '@ngrx/operators';
import { Events } from '@ngrx/signals/events';
import { HomeService } from '../services/home.service';
import { homeEvents } from './home.events';

export function createHomeEffects() {
  const homeService = inject(HomeService);
  const events = inject(Events);

  return {
    loadMessage$: events.on(homeEvents.loadMessage).pipe(
      switchMap(() =>
        homeService.getHello().pipe(
          mapResponse({
            next: (message) => homeEvents.loadMessageSuccess({ message }),
            error: (err: Error) => homeEvents.loadMessageError({ error: err.message })
          })
        )
      )
    )
  };
}
