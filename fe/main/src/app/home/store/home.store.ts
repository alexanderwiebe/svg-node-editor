import { signalStore, withState, withComputed } from '@ngrx/signals';
import { withReducer, withEventHandlers } from '@ngrx/signals/events';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { initialHomeState } from './home.state';
import { selectHasMessage, selectDisplayMessage } from './home.selectors';
import { homeReducers } from './home.reducers';
import { createHomeEffects } from './home.effects';

export const HomeStore = signalStore(
  { providedIn: 'root' },
  withDevtools('home'),
  withState(initialHomeState),
  withComputed((store) => ({
    hasMessage: selectHasMessage(store.message),
    displayMessage: selectDisplayMessage(store.message, store.error)
  })),
  withReducer(...homeReducers),
  withEventHandlers(createHomeEffects)
);
