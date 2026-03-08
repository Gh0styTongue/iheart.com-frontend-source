import { fetchGenrePreferences } from 'state/Genres/actions';
import { getHero } from 'state/Hero/actions';
import type { State, Thunk } from 'state/types';

export function getAsyncData(): Thunk<Promise<void>> {
  return async function thunk(dispatch) {
    await Promise.all([dispatch(getHero()), dispatch(fetchGenrePreferences())]);
  };
}

export function pageInfo(_state: State) {
  return {
    targeting: {
      ccrcontent1: 'home',
    },
  };
}
