import { computed, Signal } from '@angular/core';
import { HomeState } from './home.state';

export function selectMessage(state: Signal<HomeState['message']>) {
  return computed(() => state());
}

export function selectLoading(state: Signal<HomeState['loading']>) {
  return computed(() => state());
}

export function selectError(state: Signal<HomeState['error']>) {
  return computed(() => state());
}

export function selectHasMessage(message: Signal<string>) {
  return computed(() => message().length > 0);
}

export function selectDisplayMessage(
  message: Signal<string>,
  error: Signal<string | null>
) {
  return computed(() => error() ? `Error: ${error()}` : message());
}
