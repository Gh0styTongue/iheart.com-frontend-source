// # Abstract Station object
// This essentially unifies station object. Station object should have:
//
// - id: Station ID (number for live, hash for custom/talk)
// - type: Station type (live/custom/talk)
// - name: Station Name
// - description: Station Description
// - seedId: Station seed ID (artistId, trackId, featuredId)
// - rawLogo: Raw logo URL
// - logo: Logo URL
// - thumbs: Map of trackId to thumbs (-1 for thumbs down, 1 for thumbs up)
/**
 * @module models
 */

import logger, { CONTEXTS } from 'modules/Logger';
import reduxFactory from 'state/factory';
import transport from 'api/transport';
import { createStation } from 'state/Stations/services';
import { getAlbumByAlbumId } from 'state/Albums/services';
import { getAmpUrl, getCountryCode } from 'state/Config/selectors';
import { getArtistByArtistId } from 'state/Artists/services';
import { getLiveStationById } from 'state/Live/services';
import { getMyFavoritesStation } from 'state/Favorites/services';
import { getPodcast } from 'state/Podcast/services';
import { getTrackByTrackId } from 'state/Tracks/services';
import { isPlainObject, merge, mergeWith, noop } from 'lodash-es';
import { mapStation } from 'web-player/mapper';

const store = reduxFactory();

/**
 * Construct base station object with a set of attributes
 * @constructor
 * @extends module:models~Seed
 * @param {Object} attrs Attribute objects
 * @prop {(Number|String)} id Station ID
 * @prop {String} name Station name
 * @prop {String} seedType Station seed type
 * @prop {Number} seedId Station seed ID
 * @prop {String} rawLogo Station Logo URL
 * @prop {Object} thumbs Thumbs object with track ID as keys & 1/-1 as values
 */
function Station(attrs) {
  this.attrs = this.parse(merge({}, attrs));
  this.id = attrs[this.idAttribute];
}

Station.prototype.constructor = Station;
Station.prototype.idAttribute = 'id';
Station.prototype.parse = mapStation;

/**
 * Get an attribute based on name
 * @param  {String} attr Attribute name
 * @return {}      Value of that attribute
 */
Station.prototype.get = function get(attr) {
  return this.attrs[attr];
};

/**
 * Set an attribute
 * @param {String} attr Attribute name
 * @param {} val  Attribute value
 */
Station.prototype.set = function set(attr, val, customizer = noop) {
  if (isPlainObject(attr)) {
    this.attrs = mergeWith({}, this.attrs, attr, customizer);
  } else {
    this.attrs = mergeWith({}, this.attrs, { [attr]: val }, customizer);
  }
  this.id = this.attrs[this.idAttribute];
  return this;
};

/**
 * Convert this object into a POJO clone
 * @return {Object} The instance's properties
 */
Station.prototype.toJSON = function toJSON() {
  return merge({}, this.attrs);
};

/**
 * Get the next stream
 * @return {Promise<Media>}       Promise resolve to the stream media object
 */
Station.prototype.next = function next() {
  // playlist actually refers to either stream types for live or the next song to play in custom/etc.
  // In newer (i.e. OD and Podcast) playback it only ever has a single item, because the playlist
  // is manipulated mutably, and being able to hold onto the playlist information permanently for things
  // like looping is super-useful
  const playlist = this.get('playlist') || [];

  if (!playlist.length) {
    return Promise.reject(new Error('This station has no playable track'));
  }

  return Promise.resolve(playlist.shift());
};

/**
 * Set track only if it's different from the current one
 * you'll be tempted to remove the boolean return to allow chaining. Don't. It's relied on in the
 * playback lifecycle, because _next is crazy.
 * @param {Media} track New track
 * @return {Boolean} whether track changed
 */
Station.prototype.setTrack = function setTrack(track) {
  const currentTrack = this.get('track');
  if (
    // We don't have a track or
    (!currentTrack && track) ||
    // New track is null (reset) or
    !track ||
    // New track id/type is different
    currentTrack.get('type') !== track.get('type') ||
    currentTrack.id !== track.id
  ) {
    this.set('track', track);
    return true;
  }
  return false;
};

/**
 * Get the stream of a station's current track/stream
 * @return {Promise<Media>} Promise resolved the stream URL
 */
Station.prototype.stream = Function.prototype;

/**
 * Get current track of the station
 * @return {Media} Current track
 */
Station.prototype.track = function track() {
  return this.get('track');
};

/**
 * Save the station to a user's history
 * @param  {Number} profileId User profile ID
 * @param  {String} sessionId User SessionID
 * @param {Object} opts Options
 * @param {Boolean} opts.addToFavorites Whether to add to user favorites
 * @return {Promise<Station>}          Promise that resolve with the station object itself
 */
Station.prototype.save = function save(profileId, sessionId, opts) {
  return transport(
    createStation({
      ampUrl: getAmpUrl(store.getState()),
      opts,
      playedFrom: opts.playedFrom,
      profileId,
      seedId: this.get('seedId'),
      seedType: this.get('seedType'),
      sessionId,
    }),
  ).then(response => {
    const { data: station } = response;
    this.set(this.parse(station));
    return this;
  });
};

/**
 * Goes back
 */
Station.prototype.previous = function previous() {
  logger.info(CONTEXTS.PLAYBACK, 'This Station Does not support skipping back');
  return Promise.reject();
};

Station.prototype.fetch = function fetch(state = store.getState()) {
  let promise;
  const countryCode = getCountryCode(state);
  const ampUrl = getAmpUrl(state);

  switch (this.get('seedType')) {
    /* WEB-11055 - ZS -
     * these values are also expressed as constants in src/constants/stationTypes.js
     * broadly, as said above, we're trying to get away from the SeedStation concept, so as that
     * happens we should move these to the specific station types they belong to.
     * Also worth noting, artist, track, and favorites are all effectively implemented via the
     * custom radio station model, so the distinction is mostly in how they fetch
     */
    case 'live':
      // TODO: move all of these API calls to the new system. https://jira.ihrint.com/browse/WEB-9764
      promise = transport(
        getLiveStationById({ ampUrl, id: this.get('seedId') }),
      ).then(({ data }) => data.hits[0]);
      break;
    case 'artist':
      promise = transport(
        getArtistByArtistId({
          ampUrl,
          artistId: this.get('seedId'),
          countryCode,
        }),
      ).then(({ data }) => data.artist);
      break;
    case 'album':
      promise = transport(
        getAlbumByAlbumId({ albumId: this.get('seedId'), ampUrl }),
      ).then(({ data }) => data.trackBundles[0]);
      break;
    case 'track':
      promise = transport(
        getTrackByTrackId({ ampUrl, trackId: this.get('seedId') }),
      ).then(({ data }) => data.track);
      break;
    case 'favorites':
      promise = transport(
        getMyFavoritesStation(this.get('seedId'), ampUrl),
      ).then(({ data }) => ({
        seedId: this.get('seedId'),
        seedType: 'favorites',
        ...data.stations[0],
      }));
      break;
    case 'podcast':
      promise = transport(
        getPodcast(this.get('seedId'), getAmpUrl(store.getState())),
      ).then(({ data }) => data);
      break;
    default:
      break;
  }

  return promise ?
      promise.then(data => {
        this.set(this.parse(data));
        return this;
      })
    : Promise.resolve(this);
};

export default Station;
