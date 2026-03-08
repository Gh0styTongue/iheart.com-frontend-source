import { createSelector } from 'reselect';
import { get, has } from 'lodash-es';
import { getArtists } from 'state/Artists/selectors';
import { getProfileId } from 'state/Session/selectors';
import { getSlugId, getSlugOrId } from 'state/Routing/selectors';
import { getTracks } from 'state/Tracks/selectors';
import { joinPathComponents, slugify } from 'utils/canonicalHelpers';
import { State as RootState, Selector } from 'state/types';
import { State, Station } from './types';
import { Track } from 'state/Tracks/types';

export const getFavorites = createSelector<RootState, RootState, State>(
  state => state,
  state => get(state, 'favorites', {}) as State,
);

export const getRootSeedId = createSelector(getFavorites, favorites =>
  get(favorites, 'seedId', ''),
);

// default value is undefined, as false should only refer to users who explicitly do not have MFR
export const getHasMFR = createSelector(getFavorites, favorites =>
  get(favorites, 'hasMFR', undefined),
);

export const getCurrentFavoritesId = createSelector<
  RootState,
  string,
  string,
  number | null,
  State,
  number | string | null
>(
  getSlugOrId,
  getSlugId,
  getProfileId,
  getFavorites,
  (id, slugId, profileId, favorites) =>
    ((has(favorites, id) && id) ||
      (has(favorites, slugId) && slugId) ||
      (has(favorites, profileId!) && profileId)) as string | number | null,
);

export const getCurrentFavorites = createSelector(
  getFavorites,
  getCurrentFavoritesId,
  (Favorites, id) => get(Favorites, [id!], {}),
);

export function getFavoritesById(seedId: number): Selector<Station> {
  return createSelector(getFavorites, favorites => favorites?.[seedId] ?? {});
}

export function makeCurrentMFRSelector<K extends keyof Station, F = Station[K]>(
  attr: K,
  fallback?: F,
) {
  return createSelector<RootState, State, Station[K] | F>(
    getCurrentFavorites,
    favorites => get(favorites, attr, fallback) as Station[K] | F,
  );
}

export const getName = makeCurrentMFRSelector('name');

export const getUsername = makeCurrentMFRSelector('username');

export const getDescription = makeCurrentMFRSelector('description');

export const getFavoritesImage = makeCurrentMFRSelector('imagePath');

export const getSeedId = makeCurrentMFRSelector('seedId');

export const getSlug = makeCurrentMFRSelector('slug');

export const getArtistIds = makeCurrentMFRSelector(
  'artistIds',
  [] as Array<number>,
);

export const getCurrentFavoritedTracks = makeCurrentMFRSelector(
  'favoritedTracks',
  [] as Array<Track>,
);

export const getFavoriteArtists = createSelector(
  getArtists,
  getArtistIds,
  (artists, artistIds) => artistIds.map(id => get(artists, String(id))),
);

export const getFavoritedTrackIdsNotLoaded = createSelector(
  getCurrentFavoritedTracks,
  getTracks,
  (favoritedTracks, tracks) =>
    favoritedTracks
      .map(track => get(track, 'trackId'))
      .filter(trackId => !get(tracks, String(trackId))),
);

export const getTotalThumbsDown = makeCurrentMFRSelector('totalThumbsDown', 0);

export function makeMFRPath(title: string, id: number, slugId: string): string {
  if (title && id) {
    return joinPathComponents('/favorites/', slugify(title, id));
  }
  if (slugId) {
    return `/favorites/${slugId}/`;
  }
  return '/favorites/';
}

export const getMFRPath = createSelector<
  RootState,
  string,
  number,
  string,
  string
>(getName, getSeedId, getSlugId, makeMFRPath);
