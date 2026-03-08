// # Media object
// This object represents a track, episode & preroll. Its functionalities
// depends on each type.
//
// kept for posterity, but ads are no longer represented by the Media object.
// Ad Example:
// ```
// {
//  ads: [
//    {
//      adType: "AD",
//      playBefore: true,
//      preroll: true,
//      reportingId: null,
//      startDate: null,
//      url: "http://vast.iheart.com/vast/getAd?sz={AMP_SZ}&iu={AMP_IU}&ciu_szs={AMP_CIU_SZS}&cust_params=seed%3D24301872%26format%3Dnull%26playedFrom%3D530%26country%3DUS%26genre%3Dshow%26grp%3Dcc%26ccrcontent1%3D{AMP_CCRCONTENT1}%26ccrcontent2%3D{AMP_CCRCONTENT2}%26ccrcontent3%3D{AMP_CCRCONTENT3}%26ccrpos%3D8000%26g%3Dmale%26a%3Dnull%26rzip%3Dnull%26at%3DIHR_FACEBOOK%26id%3D2206366%26ts%3D1402163029997%26source%3D{AMP_SOURCE}&impl=s&gdfp_req=1&env=vp&output=xml_vast2&unviewed_position_start=1&url=referrer_url&correlator=1402163029997"
//    }
//  ]
// }
// ```
/**
 * @module models
 */

import logger, { CONTEXTS } from 'modules/Logger';
import Model from './Model';
import reduxFactory from 'state/factory';
import transport from 'api/transport';
import { get } from 'lodash-es';
import { getAmpUrl } from 'state/Config/selectors';
import { getEpisodeV1 as getEpisode } from 'state/Podcast/services';
import { getTrackByTrackId } from 'state/Tracks/services';
import { hasSkips } from 'state/Player/selectors';
import { mapEpisode, mapTrack } from 'web-player/mapper';
import { STATION_TYPE } from 'constants/stationTypes';

const store = reduxFactory();

/**
 * Media object, which is basically a wrapper around AMP track object that has extra properties
 * @constructor
 * @extends module:models~Model
 * @prop {Number} id Media ID
 * @prop {String} title Media title
 * @prop {Number} duration Media duration in second
 * @prop {String} rawLogo Media logo URL
 * @prop {String} url Media's iHeart URL
 */
function Media(...args) {
  Model.apply(this, args);
  this.set('hasFailed', false);
}

Media.prototype = Object.create(Model.prototype);
Media.prototype.constructor = Media;
Media.prototype.idAttribute = 'trackId';

Media.prototype.parse = function parse(media = {}) {
  // This flag indicates that this media is a track/episode, not preroll
  const data = { ...media };

  data.isMedia = false;

  // Map of the report call that was actually triggered
  data.reported = {};

  // `type` wasn't passed in... let's look for it then
  if (!data.type) {
    if (data.trackId) {
      data.type = 'track';
    } else if (data.episodeId) {
      data.type = 'episode';
    } else {
      // Normalize the stream object to be consistent w/ track & episode types
      data.stream = {
        url: data.url,
      };
    }
  }

  switch (data.type) {
    case 'track':
    case 'sweeper':
      this.idAttribute = 'trackId';
      data.isMedia = true;
      return mapTrack(data);
    case 'episode':
      this.idAttribute = 'episodeId';
      data.isMedia = true;
      return mapEpisode(data);
    default:
      this.idAttribute = 'reportingId';
      break;
  }
  return data;
};

/**
 * Fetch a track based on ID
 * @return {Promise} Promise with success containing the Media object
 */
Media.prototype.fetch = function fetch(state) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const self = this;
  let promise;

  switch (this.get('type')) {
    case 'track':
      if (Media.lastFailedTrackId === this.id) {
        this.set('hasFailed', true);
        promise = Promise.resolve();
      } else {
        const ampUrl = getAmpUrl(state);
        promise = new Promise(resolve => {
          transport(getTrackByTrackId({ ampUrl, trackId: this.id }))
            .then(({ data }) => data.track)
            .then(resolve)
            .catch(e => {
              const errObj = e instanceof Error ? e : new Error(e);
              logger.error([CONTEXTS.PLAYBACK], e, {}, errObj);
              this.set('hasFailed', true);
              Media.lastFailedTrackId = this.id;
              logger.info(`failed to get track with id ${this.id}`);
              resolve();
            });
        });
      }
      break;
    case 'episode':
      promise = transport(
        getEpisode({ ampUrl: getAmpUrl(store.getState()), episodeId: this.id }),
      ).then(response => get(response, ['data', 'episodeRest']));
      break;
    default:
      return Promise.reject(new Error('Invalid media type'));
  }
  return promise.then(data => self.set(self.parse(data)));
};

Media.prototype.isSkippable = function isSkippable() {
  if (this.get('type') === STATION_TYPE.TALK_EPISODE) return true;
  return hasSkips(store.getState());
};

export default Media;
