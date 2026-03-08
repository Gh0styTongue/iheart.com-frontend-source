import { ArticlesLoaded } from 'state/News/types';
import { Genre, State } from './types';
import { get, merge, setWith } from 'lodash-es';
import { mapGenre } from './shims';

export function articleLoaded(
  state: State,
  payload: ArticlesLoaded['payload'],
): State {
  if (get(payload, ['resource', 'type']) !== 'genre') return state;

  return setWith(
    merge({}, state),
    ['genres', String(get(payload, ['resource', 'id'])), 'articles'],
    get(payload, 'articles')!.map(article => article.slug),
    Object,
  );
}

export function receiveGenres(
  state: State,
  { genreData = [] }: { genreData: Array<Genre> },
): State {
  return merge({}, state, {
    genres: genreData
      .map(mapGenre)
      .reduce((mapped, genre) => ({ ...mapped, [genre.id]: genre }), {}),
    receivedGenres: true,
  });
}

export function receiveSelectedGenres(
  state: State,
  selectedGenres: { [genreId: string]: true },
): State {
  return {
    ...state,
    selectedGenres,
    genreSelected: true,
  };
}
