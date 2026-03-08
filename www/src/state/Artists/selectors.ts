import {
  addAlbumToPlaylistSelector,
  saveAlbumOverflowSelector,
  showAddTrackToPlaylistSelector,
  showAlbumOverflowSelector,
  showSaveTrackSelector,
  trackOverflowSelector,
} from 'state/Entitlements/selectors';
import { Artist, RelatedArtist, State, Track } from './types';
import { concatTitleAndVersion } from 'utils/trackFormatter';
import { createSelector, createStructuredSelector } from 'reselect';
import { get } from 'lodash-es';
import { getContent } from 'state/News/selectors';
import { getCurrentArtistDirectoryGenre } from 'state/Genres/selectors';
import { getResourceId, PlaylistInfo } from 'state/Routing/selectors';
import { joinPathComponents, slugify } from 'utils/canonicalHelpers';
import { State as RootState } from 'state/types';

export function getArtistId(
  state: RootState,
  { artistId }: { artistId: string | number },
) {
  return artistId;
}

export const getArtistsRoot = createSelector<RootState, RootState, State>(
  state => state,
  state => get(state, 'artists', {}) as State,
);

export const getArtists = createSelector<
  RootState,
  State,
  Record<string, Artist>
>(getArtistsRoot, root => get(root, 'artists', {}));

export const getArtist = createSelector(
  getArtists,
  getArtistId,
  (artists, id) => get(artists, String(id), {}) as Artist,
);

export function getArtistSimilars(numSimilars: number) {
  return createSelector(getArtists, getArtist, (artists, artist) =>
    get(artist, 'similars', [])
      .slice(0, numSimilars)
      .map((id: number | string) => get(artists, String(id))),
  );
}

export const getCurrentArtist = createSelector<
  RootState,
  Record<string, Artist>,
  PlaylistInfo | string | null,
  Artist
>(
  getArtists,
  getResourceId,
  (artists, id) => get(artists, String(id), {}) as Artist,
);

export const getCurrentArtistRelatedArtists = createSelector<
  RootState,
  Artist,
  Array<RelatedArtist>
>(getCurrentArtist, (artist: Artist) => artist?.relatedArtists ?? []);

export const getCurrentArtistTopTracks = createSelector<
  RootState,
  Artist,
  Array<Track>
>(getCurrentArtist, artist =>
  (get(artist, 'tracks', []) as Array<Track>).map((track: Track) => ({
    ...track,
    title: concatTitleAndVersion(track.title, track.version),
  })),
);

export const getCurrentArtistName = createSelector<
  RootState,
  Artist,
  Artist['artistName']
>(getCurrentArtist, artist => get(artist, 'artistName'));

export const getCurrentArtistId = createSelector<
  RootState,
  Artist,
  Artist['artistId']
>(getCurrentArtist, artist => get(artist, 'artistId'));

export const getCurrentArtistStationId = createSelector<
  RootState,
  Artist,
  Artist['stationId']
>(getCurrentArtist, artist => get(artist, 'stationId'));

export const getCurrentArtistIsFavorite = createSelector<
  RootState,
  Artist,
  Artist['favorite']
>(getCurrentArtist, artist => get(artist, 'favorite'));

export const getCurrentArtistPopularOn = createSelector(
  getCurrentArtist,
  artist => artist?.popularOnStations ?? [],
);

export const getCurrentArtistArticleSlugs = createSelector<
  RootState,
  Artist,
  Artist['articles']
>(getCurrentArtist, artist => get(artist, 'articles', []));

export const getCurrentArtistThumbs = createSelector(getCurrentArtist, artist =>
  get(artist, 'thumbs', {}),
);

export const getCurrentArtistBio = createSelector(getCurrentArtist, artist =>
  get(artist, 'artistBio', {}),
);

export const getCurrentArtistLatestRelease = createSelector(
  getCurrentArtist,
  artist => get(artist, 'latestRelease'),
);

export const getCurrentArtistAlbums = createSelector(
  getCurrentArtist,
  artist => artist?.albums ?? [],
);

export const getArtistFavorite = createSelector(getArtist, artist =>
  get(artist, 'favorite', false),
);

export const getArtistName = createSelector(getArtist, artist =>
  get(artist, 'artistName'),
);

export const getArtistStationId = createSelector(getArtist, artist =>
  get(artist, 'stationId'),
);

export const getCurrentArtistArticles = createSelector(
  getContent,
  getCurrentArtistArticleSlugs,
  (articles, artistSlugs) =>
    artistSlugs.map(slug => articles[slug]).filter(article => article),
);

export const getCurrentArtistAdGenre = createSelector(
  getCurrentArtist,
  artist => get(artist, 'adGenre'),
);

export const getArtistAdGenre = createSelector(getArtist, artist =>
  get(artist, 'adGenre'),
);

export function makeArtistPath(artistName: string, artistId: string) {
  return !artistName || !artistId ?
      null
    : joinPathComponents('/artist/', slugify(artistName, artistId));
}

export function makeAlbumDirectoryPath(artistPath: string | null) {
  return !artistPath ? null : joinPathComponents(artistPath, '/albums/');
}
export function makeNewsPath(artistPath: string | null) {
  return !artistPath ? null : joinPathComponents(artistPath, '/news/');
}
export function makeSimilarArtistsPath(artistPath: string | null) {
  return !artistPath ? null : joinPathComponents(artistPath, '/similar/');
}
export function makeSongDirectoryPath(artistPath: string | null) {
  return !artistPath ? null : joinPathComponents(artistPath, '/songs/');
}
export function makeArtistSongPath(
  artistPath: string | null,
  songName = '',
  songId?: string,
) {
  return !artistPath || !songId ?
      null
    : joinPathComponents(artistPath, '/songs/', slugify(songName, songId));
}
export function makeArtistAlbumPath(
  artistPath: string | null,
  albumName = '',
  albumId?: string,
) {
  return !artistPath || !albumId ?
      null
    : joinPathComponents(artistPath, '/albums/', slugify(albumName, albumId));
}
export function makeArtistDirectoryPath({ value }: { value?: string } = {}) {
  return value || '/artist/';
}

export const getArtistPath = createSelector<
  RootState,
  string,
  string,
  string | null
>(getCurrentArtistName, getCurrentArtistId, makeArtistPath);
export const getArtistDirectoryPath = createSelector(
  getCurrentArtistDirectoryGenre,
  makeArtistDirectoryPath,
);
export const getAlbumDirectoryPath = createSelector(
  getArtistPath,
  makeAlbumDirectoryPath,
);
export const getNewsPath = createSelector(getArtistPath, makeNewsPath);
export const getSimilarArtistsPath = createSelector(
  getArtistPath,
  makeSimilarArtistsPath,
);
export const getSongDirectoryPath = createSelector(
  getArtistPath,
  makeSongDirectoryPath,
);

export const albumOverflowsSelector = createStructuredSelector<
  RootState,
  { show: boolean; showAdd: boolean; showSave: boolean }
>({
  show: showAlbumOverflowSelector,
  showAdd: addAlbumToPlaylistSelector,
  showSave: saveAlbumOverflowSelector,
});

export const trackOverflowsSelector = createStructuredSelector<
  RootState,
  { show: boolean; showAdd: boolean; showSave: boolean }
>({
  show: trackOverflowSelector,
  showAdd: showAddTrackToPlaylistSelector,
  showSave: showSaveTrackSelector,
});
