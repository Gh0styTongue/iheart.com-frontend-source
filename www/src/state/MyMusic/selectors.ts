import { createSelector } from 'reselect';
import { get, identity } from 'lodash-es';
import { getCanPlay, getPlaylist } from 'state/Playlist/selectors';
import { State as RootState } from 'state/types';
import { State } from './types';
import type { Playlist } from 'state/Playlist/types';

export const getMyMusic = createSelector<RootState, RootState, State>(
  identity,
  state => get(state, 'myMusic'),
);

export const getCollections = createSelector(getMyMusic, myMusic =>
  get(myMusic, 'collections', {}),
);

export const getCollectionIds = createSelector(getCollections, collections =>
  get(collections, 'ids', []),
);

export const getCollectionsByIds = createSelector<
  RootState,
  RootState,
  Array<string>,
  Array<Playlist>
>(identity, getCollectionIds, (state, ids) =>
  ids
    .map(id => getPlaylist(state, { seedId: id }))
    .filter(playlist => Object.keys(playlist).length),
);

export const getPlayableCollections = createSelector(
  identity,
  getCollectionsByIds,
  (state: RootState, playlists) =>
    playlists.filter(({ playlistId, seedId }) =>
      getCanPlay(state, { playlistId, seedId }),
    ),
);

export const getHasUserGeneratedCollections = createSelector(
  getCollectionsByIds,
  collections => collections.some(collection => collection.type === 'user'),
);

export const getMyMusicCollectionByType = createSelector(
  getCollectionsByIds,
  (_: any, { playlistType }: { playlistType: string }) => playlistType,
  (collections, typeToFind) =>
    collections.find(({ type }) => type === typeToFind) || {},
);

export const getMyMusicCollectionById = createSelector(
  getCollectionsByIds,
  (_: any, { playlistId }: { playlistId: string | number }) => playlistId,
  (collections, idToFind) =>
    (collections.find(({ id }) => id === idToFind) || {}) as Playlist,
);
