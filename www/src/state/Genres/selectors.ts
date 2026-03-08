import { Article } from 'state/News/types';
import { createSelector } from 'reselect';
import { getContent } from 'state/News/selectors';
import {
  getResourceId,
  getSlugOrId,
  PlaylistInfo,
} from 'state/Routing/selectors';
import { getTranslateFunction } from 'redux-i18n';
import { joinPathComponents, slugify } from 'utils/canonicalHelpers';
import { MOST_POPULAR_ARTISTS_CATEGORY_ID } from 'state/Recs/constants';
import type { Genre, State } from './types';
import type { State as RootState, Selector } from 'state/types';

export const getGenresRoot = createSelector<RootState, RootState, State>(
  state => state,
  state => (state?.genres ?? {}) as State,
);

export const getGenres = createSelector<
  RootState,
  State,
  Record<string, Genre>
>(getGenresRoot, root => root?.genres ?? {});

export const getGenresList = createSelector<
  RootState,
  { [id: string]: Genre },
  Array<Genre>
>(getGenres, genresMap =>
  Object.keys(genresMap)
    .map(id => genresMap[id])
    .sort((a, b) => (a.name.toLowerCase() >= b.name.toLowerCase() ? 1 : -1)),
);

export const getSelectedGenres = createSelector<
  RootState,
  State,
  Record<string, boolean> | undefined
>(getGenresRoot, root => root?.selectedGenres);

const getI18n = (root: RootState) => root.i18nState;

const NON_MUSIC_GENRES = [9, 15];

export type ArtistDirectoryGenre = {
  id: number;
  title: string;
  value: string;
};

export const getArtistDirectoryGenres = createSelector<
  RootState,
  State['genres'],
  RootState['i18nState'],
  Array<ArtistDirectoryGenre>
>(getGenres, getI18n, (genres, i18nState) => {
  const translate = getTranslateFunction(
    i18nState.translations,
    i18nState.lang,
    'en',
  );
  return [
    {
      id: MOST_POPULAR_ARTISTS_CATEGORY_ID,
      title: translate('All Genres'),
      value: '/artist/',
    },
  ].concat(
    Object.values(genres)
      .filter(({ id }) => !NON_MUSIC_GENRES.includes(id))
      .map(({ name, ...rest }) => ({
        ...rest,
        title: name,
        value: `/artist/genre/${slugify(name)}/`,
      }))
      .sort((a, b) => (a.title <= b.title ? -1 : 1)),
  );
});

export const getCurrentArtistDirectoryGenre = createSelector<
  RootState,
  Array<ArtistDirectoryGenre>,
  {},
  ArtistDirectoryGenre
>(
  getArtistDirectoryGenres,
  getSlugOrId,
  (genres, slugOrId) =>
    genres.find(({ title }) => slugify(title) === slugOrId) || genres[0],
);

export const getCurrentGenre: Selector<Genre> = createSelector<
  RootState,
  Record<string, Genre>,
  PlaylistInfo | string | null,
  Genre
>(
  getGenres,
  getResourceId,
  (genres, id) => (genres?.[String(id)] ?? {}) as Genre,
);

function makeCurrentGenreSelector<T>(
  attr: keyof Genre,
  fallback?: T,
): Selector<T> {
  // To Do, resolve typing issue with parametric selector
  return createSelector<RootState, any, T>(
    getCurrentGenre,
    genre => genre?.[attr] ?? fallback,
  );
}

export const getCurrentGenreId = makeCurrentGenreSelector<number>('id');
export const getCurrentGenreName = makeCurrentGenreSelector<string>('name');
export const getCurrentGenreLogo = makeCurrentGenreSelector<string>('logo');
export const getCurrentGenreSparkStreamId =
  makeCurrentGenreSelector<string>('sparkStreamId');

export const getCurrentGenreArticleSlugs = makeCurrentGenreSelector<
  Array<string>
>('articles', []);

export const getCurrentGenreArticles = createSelector<
  RootState,
  Record<string, Article>,
  Array<string>,
  Array<Article>
>(getContent, getCurrentGenreArticleSlugs, (articles, genreSlugs) =>
  genreSlugs.map(slug => articles[slug]).filter(article => article),
);

export const getReceivedGenres = createSelector(
  getGenresRoot,
  genres => genres?.receivedGenres,
);

export function makeGenrePath(
  genreName: string,
  genreId: number,
): string | null {
  return !genreName || !genreId ?
      null
    : joinPathComponents('/genre/', slugify(genreName, genreId));
}
export const getGenrePath = createSelector<
  RootState,
  string,
  number,
  string | null
>(getCurrentGenreName, getCurrentGenreId, makeGenrePath);

export const getIsGenreSelected = createSelector(
  getGenresRoot,
  ({ genreSelected }) => genreSelected,
);
