import { createSelector } from 'reselect';
import { get, identity, mapValues } from 'lodash-es';
import { getArtistPath, getArtists } from 'state/Artists/selectors';
import { getSectionId } from 'state/Routing/selectors';
import { joinPathComponents, slugify } from 'utils/canonicalHelpers';
import { State as RootState, Selector } from 'state/types';
import { Sentiment } from 'state/Stations/types';
import { ThumbedTrackMap, Track, TrackMap } from './types';

export function getTracks(state: RootState): TrackMap {
  return state?.tracks?.tracks ?? {};
}

export function getThumbs(state: RootState): ThumbedTrackMap {
  return get(state, 'tracks.thumbs', {});
}

export function getTrackId(
  state: any,
  {
    trackId,
  }: {
    trackId: number | string;
  },
): number | string {
  return trackId;
}

export const getTrackById = createSelector<
  RootState,
  { trackId: number | string },
  TrackMap,
  number | string,
  Track
>(getTracks, getTrackId, (tracks, id) => get(tracks, String(id), {}) as Track);

export const getTrack = createSelector<
  RootState,
  { trackId: number | string },
  TrackMap,
  number | string,
  Track
>(getTracks, getTrackId, (tracks, id) => get(tracks, String(id), {}) as Track);

export function getTrackSimilars(numSimilars: number) {
  return createSelector(getTrack, getArtists, (track, artists) =>
    get(artists, [String(get(track, 'artistId')), 'similars'], [])
      .slice(0, numSimilars)
      .map((id: number | string) => get(artists, String(id), {})),
  );
}

export const getCurrentTrack = createSelector(
  getTracks,
  getSectionId,
  (tracks, id) => get(tracks, String(id), {}) as Track,
);

function makeCurrentTrackSelector<K extends keyof Track, F = Track[K]>(
  attr: K,
  fallback?: F,
) {
  return createSelector<RootState, Track, Track[K] | F>(
    getCurrentTrack,
    track => get(track, attr, fallback) as Track[K] | F,
  );
}

export const getCurrentTrackTitle = makeCurrentTrackSelector('title', '');

export const getCurrentTrackLyrics = makeCurrentTrackSelector('lyrics', '');

export const getCurrentTrackId = makeCurrentTrackSelector('id', '');

export const getCurrentTrackImage = makeCurrentTrackSelector('imageUrl', '');

export const getCurrentTrackAlbumName = makeCurrentTrackSelector(
  'albumName',
  '',
);

export const getCurrentTrackAlbumId = makeCurrentTrackSelector('albumId', '');

export const getCurrentTrackIsExplicit = makeCurrentTrackSelector(
  'explicitLyrics',
  '',
);

export const getCurrentTrackDuration = makeCurrentTrackSelector('duration', '');

export const getCurrentTrackNumber = makeCurrentTrackSelector(
  'trackNumber',
  '',
);

export function makeSongPath(
  songTitle: string | undefined,
  songId: string | number,
  artistPath: string | null,
): string | null {
  return !artistPath || !songId || !songTitle ?
      null
    : joinPathComponents(artistPath, '/songs/', slugify(songTitle, songId));
}
export const getSongPath = createSelector(
  getCurrentTrackTitle,
  getCurrentTrackId,
  getArtistPath,
  makeSongPath,
);

export const getTracksThumbs = createSelector(getThumbs, identity);

export const getTracksThumbsSentiments: Selector<{
  [x: number]: Sentiment;
}> = createSelector(getThumbs, thumbs =>
  mapValues(thumbs, v => get(v, 'sentiment', 0)),
);

export function getSentimentById(
  thumbs: { [x: number]: Sentiment },
  id: number,
): Sentiment {
  return get(thumbs, id, 0);
}
