import { getAlbumUrl, getArtistUrl, getTrackUrl } from 'utils/url';
import { merge } from 'lodash-es';
import { Sentiment } from 'state/Stations/types';
import { Thumb, ThumbedTrackMap, Track, TrackMap } from './types';
import { THUMB_RES } from 'components/MediaServerImage';

export function receiveTracks(
  state: TrackMap,
  payload: {
    tracks: Array<Track>;
  },
) {
  return payload.tracks.reduce(
    (prevState, track) => {
      const {
        albumId,
        albumName,
        albumTitle,
        artistId,
        artistName,
        id,
        isPlaceholder,
        isOnDemandTrack,
        playbackRights = {} as { onDemand?: boolean },
        rights = {} as { onDemand?: boolean },
        title,
        trackId,
        trackTitle,
      } = track;

      return merge({}, prevState, {
        [String(id || trackId)]: {
          ...track,
          albumName: albumName || albumTitle,
          albumTitle: albumName || albumTitle,
          catalogId: isPlaceholder ? null : id || trackId,
          catalogType: 'track',
          description: artistName,
          descriptionUrl: getArtistUrl(artistId, artistName),
          id: id || trackId,
          imgWidth: THUMB_RES,
          isOnDemandTrack:
            rights.onDemand || playbackRights.onDemand || isOnDemandTrack,
          title: title || trackTitle,
          trackTitle: title || trackTitle,
          url: getTrackUrl(
            artistId,
            artistName,
            id || trackId,
            title || trackTitle,
          ),
          urls: {
            album: getAlbumUrl(
              artistId,
              artistName,
              albumId,
              (albumName || albumTitle)!,
            ),
            artist: getArtistUrl(artistId, artistName),
            song: getTrackUrl(
              artistId,
              artistName,
              id || trackId,
              title || trackTitle,
            ),
          },
        },
      });
    },
    merge({}, state),
  );
}

export function receiveThumbs(
  state: ThumbedTrackMap,
  payload: Array<Thumb>,
): ThumbedTrackMap {
  const thumbs: ThumbedTrackMap = {};
  payload.forEach((thumb: Thumb) => {
    // tracks are arranged by most recent.
    // if that entry exists already, existing is more recent than incoming
    if (!thumbs[thumb.contentId]) {
      thumbs[thumb.contentId] = {
        seedType: thumb.stationType?.toLowerCase() as 'live' | 'radio',
        sentiment: thumb.state === 'UP' ? 1 : -1,
        stationId: thumb.radioStationId,
        trackId: thumb.contentId,
      };
    }
  });
  return thumbs;
}

type IncomingThumbedTrack = {
  sentiment: Sentiment;
  stationId: string;
  stationType: 'favorites' | 'live' | 'artist';
  trackId: number;
};

export function updateThumbs(
  state: ThumbedTrackMap,
  { trackId, sentiment, stationId, stationType }: IncomingThumbedTrack,
): ThumbedTrackMap {
  if (!trackId) return state;

  return merge({}, state, {
    [trackId]: {
      seedType: stationType,
      sentiment,
      stationId,
      trackId,
    },
  });
}
