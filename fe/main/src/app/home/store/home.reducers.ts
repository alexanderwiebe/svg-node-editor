import { on } from '@ngrx/signals/events';
import { homeEvents } from './home.events';
import { initialHomeState } from './home.state';

export const homeReducers = [
  on(homeEvents.loadMessage, () => ({
    loading: true,
    error: null
  })),

  on(homeEvents.loadMessageSuccess, ({ payload }) => ({
    message: payload.message,
    loading: false,
    error: null
  })),

  on(homeEvents.loadMessageError, ({ payload }) => ({
    error: payload.error,
    loading: false
  })),

  on(homeEvents.reset, () => initialHomeState)
];
