import logger, { CONTEXTS } from 'modules/Logger';
import Media from 'web-player/models/Media';
import reduxFactory from 'state/factory';
import Station from 'web-player/models/Station';
import transport from 'api/transport';
import { get } from 'lodash-es';
import { getAmpUrl, getHost } from 'state/Config/selectors';
import { postStreams } from 'state/Player/services';

const store = reduxFactory();

function MyMusic(attrs = {}) {
  Station.call(this, {
    ...attrs,
    failures: new Map(),
    stationUrl: '/your-library/',
    type: 'mymusic',
  });
  this.idAttribute = 'seedId';
  this.id = attrs.seedId;
}

MyMusic.prototype = Object.create(Station.prototype);
MyMusic.prototype.constructor = MyMusic;

MyMusic.prototype.next = function next(
  profileId,
  sessionId,
  currentTrack,
  playedFrom,
) {
  this.set('playedFrom', playedFrom);

  const isNew = this.get('isNew');
  const tracks = this.get('tracks');

  if (!tracks.length || tracks.length <= this.get('failures').size) {
    return Promise.reject(new Error('This station has no playable track'));
  }

  let foundIndex = -1;

  for (let i = 0; i < tracks.length; i += 1) {
    const { trackId } = tracks[i];
    if (trackId === currentTrack || trackId === this.currentTrackId) {
      foundIndex = i;
      break;
    }
  }

  // determine which track to play
  let trackPosition;

  if (isNew && !this.get('failures').size) {
    trackPosition = (foundIndex === -1 ? 0 : foundIndex) - 1;
  } else {
    // if the track was deleted then we need to decrement the index
    // so that the next track is the one that is now in the deleted track's position
    trackPosition = foundIndex === -1 ? this.currentIndex - 1 : foundIndex;
  }

  this.currentIndex =
    trackPosition >= tracks.length - 1 ? 0 : trackPosition + 1;

  const track = tracks[this.currentIndex];
  this.currentTrackId = track.trackId;
  const mediaObject = this.createMediaObject(track);

  return this.getStream(mediaObject, { playedFrom, profileId, sessionId })
    .then(newTrack => ({ tracks: newTrack }))
    .catch(err => {
      const errorObj = err instanceof Error ? err : new Error(err);
      logger.error(
        [CONTEXTS.PLAYBACK, CONTEXTS.OD, CONTEXTS.PLAYLIST],
        err,
        {},
        errorObj,
      );
      if (err.code === 403) return Promise.reject(err);

      return this.next(
        profileId,
        sessionId,
        this.currentTrackId,
        this.get('playedFrom'),
      );
    });
};

/**
 * Ensures the stream url is available for a given track
 * @param  {Media} track to ensure stream presence
 * @return {Promise}       promise containing the track with the stream and reporting endpoint
 */
MyMusic.prototype.getStream = function getStream(
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
      stationId: this.id,
      stationType: 'MYMUSIC',
      trackIds: [track.id],
    }),
  ).then(res => {
    const items = get(res, ['data', 'items'], []);
    // we fetch the imagePath here because we don't get it from elsewhere
    // AD (12/09/2016) - last I checked this object doesn't contain imagePath tho
    const {
      streamUrl,
      reportPayload,
      imagePath,
      content = {},
    } = items[0] || {};
    const { lyricsId } = content;

    if (streamUrl) {
      return track.set({
        imagePath,
        lyricsId,
        reportPayload,
        stream: {
          type: 'hls',
          url: streamUrl,
        },
      });
    }

    const failures = this.get('failures');
    this.set('failures', failures.set(track.get('trackId'), 1));

    return Promise.reject();
  });
};

/**
 * Get the previous song to play back
 * @param {object} creds profileId and
 * @return {Promise} a promise containing the media object with a stream for the track to play
 */
MyMusic.prototype.previous = function previous(creds = {}) {
  const tracks = this.get('tracks');
  const previousIndex =
    this.currentIndex <= 0 ? tracks.length - 1 : this.currentIndex - 1;
  const track = tracks[previousIndex];

  this.currentTrackId = track.trackId;

  const mediaObject = this.createMediaObject(track);
  const newIndex =
    (this.currentIndex === 0 ? tracks.length : this.currentIndex) - 1;
  this.currentIndex = newIndex;
  return this.getStream(mediaObject, creds).catch(err => {
    const errorObj = err instanceof Error ? err : new Error(err);
    logger.error(
      [CONTEXTS.PLAYBACK, CONTEXTS.OD, CONTEXTS.PLAYLIST],
      err,
      {},
      errorObj,
    );
    if (err.code === 403) return Promise.reject(err);
    return this.previous(creds);
  });
};

MyMusic.prototype.createMediaObject = function createMediaObject({
  duration,
  trackId,
  albumId,
  artistId,
  trackTitle,
  artistName,
  albumTitle,
  playbackRights,
}) {
  return new Media({
    album: albumTitle,
    albumId,
    artist: artistName,
    artistId,
    duration,
    playbackRights,
    stationId: this.id,
    stationSeedId: this.get('seedId'),
    stationSeedType: this.get('seedType'),
    title: trackTitle,
    trackId,
  });
};

MyMusic.prototype.toJSON = function toJSON() {
  return { ...this.attrs, failures: new Map() };
};

export default MyMusic;
