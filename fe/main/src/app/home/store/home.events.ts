import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

export const homeEvents = eventGroup({
  source: 'Home',
  events: {
    loadMessage: type<void>(),
    loadMessageSuccess: type<{ message: string }>(),
    loadMessageError: type<{ error: string }>(),
    reset: type<void>()
  }
});
