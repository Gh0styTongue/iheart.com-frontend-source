/* WEB-11055 - ZS -
 * There are two or three different methods of getting custom radio depending on how you count
 * by and large there is track (song2start) artist (everything else) and favorites (MFR). They are
 * all run through this model, which probably isn't the greatest idea ever
 */

import factory from 'state/factory';
import Station from 'web-player/models/Station';
import transport from 'api/transport';
import { adsMeta } from 'state/Ads/services';
import { getAmpUrl } from 'state/Config/selectors';
import { mapCustomStation } from 'web-player/mapper';
import { nextCustomTrack } from 'web-player/models/helpers/custom';
import { STATION_TYPE } from 'constants/stationTypes';
import { STREAM_TYPE } from 'web-player/models/constants';

const store = factory();

/**
 * Custom station object
 * @constructor
 * @extends module:models~Station
 * @param {Object} attrs Attributes
 * @prop {String} id Station ID
 * @prop {String} type "custom"
 * @prop {String} name Station name
 * @prop {String} seedType "artist", "track" or "featured"
 * @prop {Number} seedId Artist ID, Track ID or Featured Station ID
 * @prop {String} rawLogo Station Logo URL
 * @prop {String} url URL to that station on iheart.com
 * @prop {Object} thumbs Thumbs object with track ID as keys & 1/-1 as values
 */
function CustomStation(attrs) {
  Station.call(this, attrs);
  // checkAd is used for ads in custom
  this.set('checkAd', false);
  return this;
}

CustomStation.prototype = Object.create(Station.prototype);
CustomStation.prototype.constructor = CustomStation;

CustomStation.prototype.parse = mapCustomStation;

CustomStation.prototype.idAttribute = 'radioId';

CustomStation.prototype.getTrackStreamId = function getTrackStreamId() {
  /**
   * WEB-12832
   * We were previously just getting the id at the root of the obj.
   * This reaches into the object a little further where the reporting key is located.
   * keeping the id in the false clause as a fall back.
   */
  return {
    streamId:
      this.get('attrs.reportingKey') ?
        this.get('attrs.reportingKey')
      : this.get('id'),
    streamType: STREAM_TYPE.RADIO,
  };
};

CustomStation.prototype.getAdStreamId = function getAdStreamId() {
  const { stationType } = this.attrs;
  let streamId = 'seedId';

  if (stationType === 'FAVORITES' || stationType === 'ARTIST') {
    streamId = 'id';
  }

  return {
    streamId: this.get(streamId),
    streamType:
      this.get('seedType') === STATION_TYPE.FAVORITES ?
        STREAM_TYPE.RADIO
      : STREAM_TYPE.ARTIST,
  };
};

/**
 * Get the next track, going thru local `tracks` first, then fetch more
 * playlist radio is a variant on custom so a lot of these methods are helpers that allow both types
 * to use the same shared logic
 * @param  {Number}   profileId Profile ID
 * @param  {String}   sessionId Session ID
 * @param  {Number=}   trackId   Track ID
 * @param  {Object}   opts      Options
 * @param {Number} opts.playedFrom Played From value
 * @return {Promise} Promise containing track
 */
CustomStation.prototype.next = function next(
  profileId,
  sessionId,
  trackId,
  playedFrom,
) {
  // IHRWEB-15411 keeping, but highlighting, for Web-Ads 2.0 implementation (MP):
  return nextCustomTrack(this, profileId, sessionId, trackId, playedFrom);
};

CustomStation.prototype.fetch = function fetch() {
  const ampUrl = getAmpUrl(store.getState());

  return (
    Station.prototype.fetch
      .call(this)
      // we have two initialization flows for custom radio, this covers both cases
      .then(() => {
        if (this.get('seedType') === STATION_TYPE.ARTIST) {
          // we need to fetch genre for advertising targeting
          return transport(
            adsMeta(ampUrl, this.get('seedArtistId') || this.get('artistId')),
          ).then(({ data }) => data);
        }

        return {};
      })
      .then(({ adswizzGenre }) => this.set('adGenre', adswizzGenre))
  );
};

export default CustomStation;
