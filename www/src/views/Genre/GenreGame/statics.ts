import { genresRequest } from 'state/Genres/actions';
import { getGenres } from 'state/Genres/selectors';
import type { Thunk } from 'state/types';

export function getAsyncData(): Thunk<Promise<void>> {
  return async function thunk(dispatch, getState) {
    const genres = getGenres(getState());
    if (Object.keys(genres).length) return;
    await dispatch(genresRequest());
  };
}
