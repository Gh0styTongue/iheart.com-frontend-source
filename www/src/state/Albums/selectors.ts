import { Album, State, Track } from './types';
import { concatTitleAndVersion } from 'utils/trackFormatter';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import { getArtistPath, getCurrentArtistId } from 'state/Artists/selectors';
import { getSectionId } from 'state/Routing/selectors';
import { joinPathComponents, slugify } from 'utils/canonicalHelpers';
import { State as RootState } from 'state/types';

export function getAlbumsRoot(state: RootState): State {
  return get(state, 'albums', {});
}

export function getAlbumId(state: RootState, { albumId }: { albumId: number }) {
  return albumId;
}

export const getAlbums = createSelector<
  RootState,
  State,
  Record<string, Album>
>(getAlbumsRoot, root => get(root, 'albums', {}));

export const getAlbumsByCurrentArtist = createSelector<
  RootState,
  State,
  string,
  Array<Album>
>(getAlbumsRoot, getCurrentArtistId, (albums, id) =>
  get(albums, [String(id), 'albums'], []),
);

export const getNextAlbumsLinkByCurrentArtist = createSelector(
  getAlbumsRoot,
  getCurrentArtistId,
  (albums, id) => get(albums, [String(id), 'links', 'next'], ''),
);

export const getAlbum = createSelector<
  RootState,
  { albumId: number },
  Record<string, Album>,
  number,
  Album
>(getAlbums, getAlbumId, (albums, id) => get(albums, String(id), {}) as Album);

export const getAlbumTracks = createSelector(getAlbum, album =>
  get(album, 'tracks', []),
);

export const getCurrentAlbum = createSelector(
  getAlbums,
  getSectionId,
  (albums, id) => get(albums, String(id), {}) as Album,
);

export const getCurrentAlbumTracks = createSelector(getCurrentAlbum, album =>
  (get(album, 'tracks', []) as Array<Track>).map(track => ({
    ...track,
    title: concatTitleAndVersion(track.title, track.version),
  })),
);

function makeCurrentAlbumSelector<K extends keyof Album, F = Album[K]>(
  attr: K,
  fallback?: F,
) {
  return createSelector<RootState, Album, Album[K] | F>(
    getCurrentAlbum,
    album => get(album, attr, fallback) as Album[K] | F,
  );
}

export const getCurrentAlbumTitle = makeCurrentAlbumSelector('title');
export const getCurrentAlbumId = makeCurrentAlbumSelector('albumId');
export const getCurrentAlbumReleaseDate =
  makeCurrentAlbumSelector('releaseDate');
export const getCurrentAlbumExplicit =
  makeCurrentAlbumSelector('explicitLyrics');
export const getCurrentAlbumPublisher = makeCurrentAlbumSelector('publisher');
export const getCurrentAlbumCopyright = makeCurrentAlbumSelector('copyright');

function makeAlbumSelector<K extends keyof Album, F = Album[K]>(
  attr: K,
  fallback?: F,
) {
  return createSelector<RootState, { albumId: number }, Album, Album[K] | F>(
    getAlbum,
    album => get(album, attr, fallback) as Album[K] | F,
  );
}

export const getAlbumReleaseDate = makeAlbumSelector('releaseDate', 0);
export const getAlbumTotalSongs = makeAlbumSelector('totalSongs', 0);
export const getAlbumExplicit = makeAlbumSelector('explicitLyrics');
export const getHasAlbum = createSelector(
  getAlbum,
  album => !!Object.keys(album).length,
);

export const getCurrentArtistAlbumById = createSelector<
  RootState,
  { stationId: number },
  number,
  Array<Album>,
  Album
>(
  (_: RootState, { stationId }: { stationId: number }) => stationId,
  getAlbumsByCurrentArtist,
  (albumId, albums) =>
    albums.find(album => String(get(album, 'albumId')) === String(albumId))!,
);
export function makeCurrentArtistAlbumByIdSelector<
  K extends keyof Album,
  F = Album[K],
>(attr: K, fallback?: F) {
  return createSelector<RootState, { stationId: number }, Album, Album[K] | F>(
    getCurrentArtistAlbumById,
    album => get(album, attr, fallback) as Album[K] | F,
  );
}
export const getCurrentArtistAlbumByIdTopSongs =
  makeCurrentArtistAlbumByIdSelector('totalSongs', 0);
export const getCurrentArtistAlbumByIdReleaseDate =
  makeCurrentArtistAlbumByIdSelector('releaseDate', 0);

export function makeAlbumPath(
  albumTitle: string,
  albumId: number,
  artistPath: string | null,
) {
  return !albumTitle || !albumId || !artistPath ?
      null
    : joinPathComponents(artistPath, '/albums/', slugify(albumTitle, albumId));
}

export const getAlbumPath = createSelector<
  RootState,
  string,
  number,
  string | null,
  string | null
>(getCurrentAlbumTitle, getCurrentAlbumId, getArtistPath, makeAlbumPath);
