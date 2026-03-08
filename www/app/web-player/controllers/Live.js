import LiveStation from 'web-player/models/Live';
import Media from 'web-player/models/Media';
import reduxFactory from 'state/factory';
import StationController from './Station';
import whenPopulated from 'utils/whenPopulated';
import { createStructuredSelector } from 'reselect';
import { getIsAnonymous } from 'state/Session/selectors';
import { getProfileReceived } from 'state/Profile/selectors';
import { PlayerError } from '../utils/errors';

const store = reduxFactory();

function LiveController(...args) {
  StationController.apply(this, args);
}

LiveController.prototype = Object.create(StationController.prototype);
LiveController.prototype.constructor = LiveController;
LiveController.prototype.playedFromPrefix = 3;
LiveController.prototype._modelClass = LiveStation;
LiveController.prototype.supportSkip = false;

/**
 * Load a live station based on ID
 * @param  {Number} id Live Station ID
 * @return {Promise}        Promise containing the station object
 */
LiveController.prototype.loadSeedStation = function loadSeedStation(
  id,
  type,
  profileId,
  sessionId,
  opts,
) {
  const station = new LiveStation({ id, ...opts });
  return station.fetch();
};

/**
 * Load a station object
 * @param  {models.LiveStation} station      Live Station object
 * @param  {Object} opts         Options
 * @return {Promise}             Promise containing Live Station object
 */
LiveController.prototype.loadStation = function loadStation(stationObj) {
  const station = new LiveStation(stationObj.attrs || stationObj);

  station.set({
    retryCount: 0,
    trackIndex: 0,
  });

  return whenPopulated(
    store,
    createStructuredSelector({
      isAnonymous: getIsAnonymous,
      profileReceived: getProfileReceived,
    }),
    ({ isAnonymous, profileReceived }) => isAnonymous || profileReceived,
  ).then(() => {
    station.resetStreamProtocols();
    return station;
  });
};

/**
 * Handles a Live Station related err
 * @return {Promise} a Promise that's resolved when we can handle the issue & rejected if we can't
 */
LiveController.prototype.handleError = function handleError(station) {
  const retryCount = station.get('retryCount') || 0;

  /* WEB-11055 - ZS -
   * We try to load a station 10 times. Regardless of how many streams are potentially available.
   * Only then does it fail. This includes non-supported stream types as well, including insecure
   * urls and rtmp.
   */
  if (retryCount > 10) {
    return Promise.reject(
      new PlayerError(
        'TOO_MANY_RETRIES',
        'This station has been retried more than 10 times',
      ),
    );
  }

  // Otherwise, if we're already tried all the streams, reset the cycle
  if (!station.get('streamProtocols').length) {
    station.resetStreamProtocols();
    station.set('trackIndex', 0);
  }

  station.set('retryCount', retryCount + 1);

  return Promise.resolve(null);
};

/**
 * Resolve metadata from live stream
 * @param  {Object} metadata Metadata object
 * @return {Promise/undefined}         Promise of weblib.models.Media or nothing if metadata cannot be resolved
 */
LiveController.prototype.handleMetadata = function handleMetadata(
  station,
  currentTrackId,
  data,
) {
  // TODO: the handleMetadata and processMetadata really don't need to be on this singleton class
  // they don't reference `this`.  Leaving them here so as not to disrupt the delicate setTrack flow
  // in Main.js
  /* WEB-11055 - ZS -
   * I have no idea how that could even happen. But here it is! Actually it's theoretically possible
   * for another stream to have metadata inserted, but most of the time this shouldn't happen at all
   */
  if (!station || station.get('seedType') !== 'live') {
    return Promise.reject(new Error('No station loaded yet'));
  }

  if (!data) {
    return Promise.reject(new Error('Invalid param'));
  }

  // We're dealing w/ chromecast HLS, it'll have title, artistName, imagePath & customData
  if (data.type === 'hls') {
    return this._processMetadata(station, currentTrackId, data);
  }

  // We're dealing with other types
  const { metadata } = data;

  if (!metadata) return Promise.resolve(null);

  /* WEB-11055 - ZS -
   * these values are usually sent by third party streams. I have never actually seen this code used,
   * but I'm not 100% it's not used at all either
   */
  if (!metadata.url && metadata.artist && metadata.title) {
    return Promise.resolve(
      new Media({
        artist: metadata.artist,
        title: metadata.title,
        type: 'track',
      }),
    );
  }

  /* WEB-11055 - ZS -
   * A lot of the time, the data is actually serialized as a url, so we need to deserialize before we're
   * actually able to process the information to actually display it
   */
  metadata.customData = this._parseUrl(decodeURIComponent(metadata.url));

  return this._processMetadata(station, currentTrackId, metadata);
};

/**
 * Parses song_spot URL in the live metadata
 * this is probably able to be deprecated in favor of something like qs or the like
 * @return {Object} Media object, if extractable
 */
LiveController.prototype._parseUrl = function _parseUrl(url) {
  const data = {};
  let kv;

  // added an extra space to tokenizer from:
  // http://stackoverflow.com/questions/168171/regular-expression-for-parsing-name-value-pairs
  const tokenizer = /([^ =,]*)=("(?:\\.|[^"\\]+)*"|[^,"]*)/g;
  let value;

  /* eslint-disable no-cond-assign */
  while ((kv = tokenizer.exec(url))) {
    value = kv[2].toString();
    // value will be '"some data"' so remove the extra quote
    data[kv[1]] = value.substr(1, value.length - 2);
  }
  /* eslint-enable no-cond-assign */

  return data;
};

/**
 * Process data object from stream
 * this is effectively an extension of the above, and doesn't really need to be two functions other than
 * the terrible management of invocations above.
 * @param  {Object} station Current station
 * @param  {Number} currentTrackId Current track being played
 * @param  {Object} data Data object, with title, artist, imageUrl & customData which has song_spot
 * @return {Promise}     Promise resolved when processing is done
 */
LiveController.prototype._processMetadata = function _processMetadata(
  station,
  currentTrackId,
  data,
) {
  let track;

  const { customData } = data;

  if (!customData) return Promise.resolve(null);

  const trackId = Number(customData.TPID) || 0;

  /* WEB-11055 - ZS -
   * M stands for media, i.e. an actual track, that is playing and is music
   *
   * IHRWEB-18215 F stands for fill song - mieka
   */
  if (['M', 'F'].includes(customData.song_spot)) {
    // If we have a track ID, do a lookup
    if (trackId) {
      // Valid trackId & we've loaded a different/no track, do a lookup
      if (!currentTrackId || currentTrackId !== trackId) {
        return station.loadTrackById(trackId).then(mediaObj => {
          if (!mediaObj.get('hasFailed')) return mediaObj;
          return new Media({
            ...mediaObj,
            artist: data.artist,
            imagePath: data.imageUrl,
            stream: {},
            title: data.title,
            type: 'track',
          });
        });
      }
    } else {
      track = new Media({
        artist: data.artist,
        imagePath: data.imageUrl,
        stream: {},
        title: data.title,
        type: 'track',
      });
    }
  }

  /* WEB-11055 - ZS -
   * T is a viero ad filled and sold by local stations rather than targeted from within digital
   *
   * song_spot == 'T' doesn't appear to have had special handling - mieka IHRWEB-18215 7/25/22
   */

  // TODO (AD - 09/22/2015) - we should be handling song_spot == 'O'
  // also this method is calling (maybe) a bit too many times
  // work has been logged here https://jira.ihrint.com/browse/WEB-6782

  return Promise.resolve(track);
};

export default LiveController;
