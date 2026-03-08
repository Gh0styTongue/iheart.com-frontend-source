/**
 * @module models
 */

import Media from './Media';
import reduxFactory from 'state/factory';
import Station from './Station';
import transport from 'api/transport';
import whenPopulated from 'utils/whenPopulated';
import {
  addZipToOwnedAndOperatedStreams,
  createStreamList,
} from 'state/Live/helpers/streams';
import { createStation } from 'state/Stations/services';
import { createStructuredSelector } from 'reselect';
import { getAmpUrl } from 'state/Config/selectors';
import { getCurrentZip } from 'state/Location/selectors';
import { getIsAnonymous } from 'state/Session/selectors';
import { getIsOwnedAndOperated } from 'state/Live/selectors';
import { getPivotGeoEnabled } from 'state/Features/selectors';
import { getProfileReceived, getZipCode } from 'state/Profile/selectors';
import { isEmpty } from 'lodash-es';
import { isPrivacyOptOut } from 'trackers/privacyOptOut';
import { mapLiveStation } from 'web-player/mapper';
import { registerListen as registerListenService } from 'state/Live/services';

const store = reduxFactory();

/**
 * Live Station object
 * @constructor
 * @extends module:models~Station
 * @param {Object} attrs Attributes
 * @prop {String} id Station ID
 * @prop {String} type "live"
 * @prop {String} name Station name
 * @prop {String} seedType "live"
 * @prop {Number} seedId Live Station ID
 * @prop {String} rawLogo Station Logo URL
 * @prop {String} url URL to that station on iheart.com
 * @prop {Object} thumbs Thumbs object with track ID as keys & 1/-1 as values
 */
function LiveStation(attrs) {
  Station.call(this, attrs);
}

LiveStation.prototype = Object.create(Station.prototype);
LiveStation.prototype.constructor = LiveStation;

/**
 * Parse the live station data, also turning streams into Media objects
 * @param  {Object} data Data
 * @return {Object}      Processed data
 */
LiveStation.prototype.parse = function parse(data) {
  const station = mapLiveStation(data);
  station.streamProtocols = this._parseStreamProtocols(
    station.streams,
    data.id,
  );
  station.trackIndex = 0;
  return station;
};

LiveStation.prototype.resetStreamProtocols = function resetStreamProtocols() {
  this.set('streamProtocols', this._parseStreamProtocols(this.get('streams')));
};

/**
 * Parse the stream map
 * @param  {Object} streams Stream map
 * @return {Media[]}        Array of media objects
 */
LiveStation.prototype._parseStreamProtocols = function _parseStreamProtocols(
  streams = {},
  id = this.id,
) {
  if (isEmpty(streams)) {
    return [];
  }

  const state = store.getState();
  const privacyOptOut = isPrivacyOptOut(state);

  const zip = privacyOptOut ? null : getZipCode(state) || getCurrentZip(state);
  const isPivotEnabled = getPivotGeoEnabled(state);
  const isOwnedAndOperated = getIsOwnedAndOperated(state, { stationId: id });

  const streamsCopy = addZipToOwnedAndOperatedStreams(
    streams,
    id,
    zip,
    isPivotEnabled,
    isOwnedAndOperated,
  );

  const streamList = createStreamList(streamsCopy);

  const mediaData = {
    stationId: id,
    stationSeedId: id,
    stationSeedType: 'live',
    type: 'live',
  };

  /* WEB-11055 - ZS -
   * We represent individual stream types as media, only to be overwritten once playback starts
   * we override to represent specific tracks with new media objects, or read from the station
   * to show the station defaults
   */
  return streamList.map(stream => new Media({ ...mediaData, stream }));
};

LiveStation.prototype.save = function save(profileId, sessionId, opts) {
  return Promise.all([
    transport(
      createStation({
        ampUrl: getAmpUrl(store.getState()),
        opts,
        playedFrom: opts.playedFrom,
        profileId,
        seedId: this.get('seedId'),
        seedType: this.get('seedType'),
        sessionId,
      }),
    ),
    whenPopulated(
      store,
      createStructuredSelector({
        isAnonymous: getIsAnonymous,
        profileReceived: getProfileReceived,
      }),
      ({ isAnonymous, profileReceived }) => isAnonymous || profileReceived,
    ),
  ]).then(
    ([
      {
        data: { station },
      },
    ]) => {
      this.set(this.parse(station));
      return this;
    },
  );
};

/* WEB-11055 - ZS -
 * We report when a station starts, and we report when a new track starts for royalty purposes. We
 * are currently using v1 amp calls for a lot of this, but there have been asks about moving to v3
 * for live as well since the OD implementation
 */
LiveStation.prototype.registerListen = function registerListen(
  profileId,
  sessionId,
) {
  if (this.get('reported')) {
    return Promise.reject(new Error('Station already registered listen'));
  }
  this.set('reported', true);
  return transport(
    registerListenService({
      ampUrl: getAmpUrl(store.getState()),
      id: this.id,
      isSaved: true,
      profileId,
      sessionId,
    }),
  );
};

/**
 * Load a track based on its ID
 * This allows us to fill in information that isn't provided by the ID3 tags that come with the metadata
 * itself
 * @param  {Number} id Track ID
 * @return {Promise<Media>}   Promise resolve to the track Media object
 */
LiveStation.prototype.loadTrackById = function loadTrackById(id) {
  return new Media({
    stationId: this.id,
    stationSeedId: this.id,
    stationSeedType: 'live',
    trackId: id,
  }).fetch(store.getState());
};

/**
 * Get the next stream
 * This is yet another destructively consumed array that needs to be regenerated every time we loop
 * through the list. We try 10 times regardless of how many options are available
 * @return {Promise<Media>}       Promise resolve to the stream media object
 */
LiveStation.prototype.next = function next() {
  const streamProtocols = this.get('streamProtocols') || [];

  if (!streamProtocols.length) {
    return Promise.reject(new Error('This station has no playable track'));
  }

  return Promise.resolve({ tracks: streamProtocols.shift() });
};

export default LiveStation;
