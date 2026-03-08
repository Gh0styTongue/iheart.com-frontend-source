import logger, { CONTEXTS } from 'modules/Logger';
import Media from 'web-player/models/Media';
import reduxFactory from 'state/factory';
import Station from 'web-player/models/Station';
import transport from 'api/transport';
import { concatTitleAndVersion } from 'utils/trackFormatter';
import { encodePlaylistSeedId } from 'state/Playlist/helpers';
import { get } from 'lodash-es';
import { getAmpUrl, getHost } from 'state/Config/selectors';
import { getPlaylist } from 'state/Playlist/selectors';
import { getStation } from 'state/Playback/selectors';
import { getTrackById } from 'state/Tracks/selectors';
import { loadTrack } from 'state/Playback/actions';
import { postStreams } from 'state/Player/services';
import { requestTracks } from 'state/Tracks/actions';
import { STATION_TYPE } from 'constants/stationTypes';

const store = reduxFactory();

function CollectionStation(attrs = {}) {
  const seedId = attrs.seedId || encodePlaylistSeedId(attrs.userId, attrs.id);
  Station.call(this, {
    failures: new Map(),
    playlistId: attrs.playlistId || attrs.id,
    seedId,
    seedType: STATION_TYPE.COLLECTION,
    type: STATION_TYPE.COLLECTION,
    ...attrs,
  });

  this.id = seedId;
}

CollectionStation.prototype = Object.create(Station.prototype);
CollectionStation.prototype.constructor = CollectionStation;

CollectionStation.prototype.idAttribute = 'seedId';

CollectionStation.prototype.getTrackObject = function getTrackObject(
  trackId,
  id,
) {
  const track = getTrackById(store.getState(), { trackId }) || {};

  return Object.keys(track).length ?
      {
        ...track,
        id,
        trackId,
      }
    : null;
};

CollectionStation.prototype.getTrack = function getTrack(trackId, id) {
  return store
    .dispatch(requestTracks([trackId]))
    .then(() => this.getTrackObject(trackId, id));
};

CollectionStation.prototype.next = function next(
  profileId,
  sessionId,
  startTrack,
  playedFrom,
) {
  this.set('playedFrom', playedFrom);
  const playlist = getPlaylist(store.getState(), {
    seedId: this.get('seedId'),
  });
  const currentTrackId =
    (startTrack && this.get('uniqueTrackId')) ||
    get(getStation(store.getState()), 'uniqueTrackId');
  const tracks =
    playlist.isShuffled ? playlist.shuffledTracks : playlist.tracks;
  const hasPlayableTracks = tracks.find(({ removed }) => !removed);

  if (!hasPlayableTracks || tracks.length <= this.get('failures').size) {
    return Promise.reject(new Error('This station has no playable track'));
  }

  let currentTrack;
  let nextTrack;

  tracks.some(track => {
    const { id, removed } = track;

    if (id === currentTrackId) {
      currentTrack = track;
    } else if (currentTrack && !removed) {
      nextTrack = track;
      return true;
    }

    return false;
  });

  // we reached the end of the array and didn't find not removed tracks
  // Start from the beginning and pick first available
  if (!nextTrack) {
    nextTrack = tracks.find(({ removed }) => !removed);
  }

  // DS: startTrack is a trackID passed in when specific track is clicked,
  // in that case we play it and not the next one
  const { trackId, id } = startTrack && currentTrack ? currentTrack : nextTrack;
  const track = this.getTrackObject(trackId, id);
  const promise = track ? Promise.resolve(track) : this.getTrack(trackId, id);

  store.dispatch(loadTrack(trackId, id));

  return promise.then(receivedTrack => {
    // `receivedTrack` may be null because it is no longer in the catalog
    // in that case, call next
    if (!receivedTrack) {
      return this.next(profileId, sessionId, null, this.get('playedFrom'));
    }
    const trackMedia = this.createMediaObject(receivedTrack);

    return this.getStream(trackMedia, { playedFrom, profileId, sessionId })
      .then(newTrack => ({ tracks: newTrack }))
      .catch(err => {
        const errObj = err instanceof Error ? err : new Error(err);
        logger.error(
          [CONTEXTS.PLAYBACK, CONTEXTS.OD, CONTEXTS.PLAYLIST],
          err,
          {},
          errObj,
        );
        if (get(err, ['response', 'status']) === 403) {
          return Promise.reject(err);
        }
        return this.next(profileId, sessionId, null, this.get('playedFrom'));
      });
  });
};

/**
 * Get the previous song to play back
 * @return {Promise} a promise containing the media object with a stream for the track to play
 */
CollectionStation.prototype.previous = function previous(
  creds = {},
  playedFrom,
) {
  this.set('playedFrom', playedFrom);
  const playlist = getPlaylist(store.getState(), {
    seedId: this.get('seedId'),
  });
  const currentTrackId = get(getStation(store.getState()), 'uniqueTrackId');
  const tracks =
    playlist.isShuffled ? playlist.shuffledTracks : playlist.tracks;
  const hasPlayableTracks = tracks.find(({ removed }) => !removed);

  if (!hasPlayableTracks || tracks.length <= this.get('failures').size) {
    return Promise.reject(new Error('This station has no playable track'));
  }

  let currentTrackFound;
  let firstPlayableTrack;
  let prevTrack;

  for (let i = tracks.length - 1; i >= 0; i -= 1) {
    const { id, removed } = tracks[i];

    if (!removed && !firstPlayableTrack) {
      firstPlayableTrack = tracks[i];
    }

    if (id === currentTrackId) {
      currentTrackFound = true;
    } else if (currentTrackFound && !removed) {
      prevTrack = tracks[i];
      break;
    }
  }

  if (!prevTrack) prevTrack = firstPlayableTrack;

  const { trackId, id } = prevTrack;
  const track = this.getTrackObject(trackId, id);
  const promise = track ? Promise.resolve(track) : this.getTrack(trackId, id);

  store.dispatch(loadTrack(trackId, id));

  return promise.then(receivedTrack => {
    // `receivedTrack` may be null because it is no longer in the catalog
    // in that case, call previous
    if (!receivedTrack) {
      return this.previous(creds, this.get('playedFrom'));
    }
    const trackMedia = this.createMediaObject(receivedTrack);

    return this.getStream(trackMedia, creds).catch(err => {
      const errorObj = err instanceof Error ? err : new Error(err);
      logger.error(
        [CONTEXTS.PLAYBACK, CONTEXTS.OD, CONTEXTS.PLAYLIST],
        err,
        {},
        errorObj,
      );
      if (get(err, 'code') === 403) {
        return Promise.reject(errorObj);
      }

      return this.previous(creds, this.get('playedFrom'));
    });
  });
};

CollectionStation.prototype.createMediaObject = function createMediaObject(
  data,
) {
  const {
    duration,
    trackId,
    albumId,
    artistId,
    title,
    artistName,
    albumTitle,
    id,
    playbackRights,
    version,
  } = data || {};

  return new Media({
    album: albumTitle,
    albumId,
    artist: artistName,
    artistId,
    duration,
    playbackRights,
    reported: {},
    reportingKey: this.get('reportingKey'),
    stationId: this.id,
    stationSeedId: this.get('playlistId'),
    stationSeedType: this.get('seedType'),
    title: concatTitleAndVersion(title, version),
    trackId,
    uniqueId: id,
  });
};

/**
 * Ensures the stream url is available for a given track
 * @param  {Media} track to ensure stream presence
 * @return {Promise}       promise containing the track with the stream and reporting endpoint
 */
CollectionStation.prototype.getStream = function getStream(
  track,
  { profileId, sessionId, playedFrom = this.get('playedFrom') } = {},
) {
  // return if we already have the stream object defined
  if (track.get('stream')) {
    return Promise.resolve(track);
  }

  const state = store.getState();

  return transport(
    postStreams({
      ampUrl: getAmpUrl(state),
      host: getHost(state),
      playedFrom,
      profileId,
      sessionId,
      stationId: this.get('playlistId'),
      stationType: 'COLLECTION',
      trackIds: [track.id],
    }),
  )
    .then(({ data: { items = [] } }) => {
      // currently this just returns nothing for cases where the stream is not available
      // we mock the response trivially to protect playback
      if (!items[0]) {
        const errObj = new Error(`No stream found for ${track.id}`);
        logger.error(
          [CONTEXTS.PLAYBACK, CONTEXTS.OD, CONTEXTS.PLAYLIST],
          errObj.message,
          {},
          errObj,
        );
      }

      const { streamUrl, reportPayload, content = {} } = items[0] || {};
      const { lyricsId } = content;

      if (streamUrl) {
        return track.set({
          lyricsId,
          reportPayload,
          stream: {
            type: 'hls',
            url: streamUrl,
          },
        });
      }
      const failures = this.get('failures');
      this.set('failures', failures.set(track.get('uniqueId'), 1));
      return Promise.reject();
    })
    .catch(error => {
      const errObj = error instanceof Error ? error : new Error(error);
      logger.error(
        [CONTEXTS.PLAYBACK, CONTEXTS.OD, CONTEXTS.PLAYLIST],
        errObj.message,
        {},
        errObj,
      );
      throw errObj; // needs to re-throw so that the catch block in previous and next can do their thing
    });
};

CollectionStation.prototype.save = function save() {
  return Promise.resolve();
};

export default CollectionStation;
