// # utils.common
// Library composed of common utility functions that are used the most.
/**
 * @module utils/common
 */

import { STATION_TYPE } from 'constants/stationTypes';

/**
 * Get station type (live/custom/talk) based on seed types
 * @param  {String} type seed type
 * @return {String}      Station type
 */
export function getStationType(type) {
  switch (type) {
    case STATION_TYPE.LIVE:
      return type;
    case STATION_TYPE.CUSTOM:
    case STATION_TYPE.ARTIST:
    case STATION_TYPE.FAVORITES:
    case STATION_TYPE.FEATURED:
    case STATION_TYPE.TRACK:
      return STATION_TYPE.CUSTOM;
    case STATION_TYPE.TALK:
    case STATION_TYPE.PODCAST:
      return STATION_TYPE.TALK;
    case STATION_TYPE.COLLECTION:
    case STATION_TYPE.ALBUM:
    case STATION_TYPE.MY_MUSIC:
      return 'playlist';
    case STATION_TYPE.PLAYLIST_RADIO:
      return 'playlist_radio';
    default:
      return '';
  }
}
