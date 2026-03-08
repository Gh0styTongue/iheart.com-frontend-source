import Station from 'web-player/models/Station';
import { encodePlaylistSeedId } from 'state/Playlist/helpers';
import { nextCustomTrack } from 'web-player/models/helpers/custom';
import { STATION_TYPE } from 'constants/stationTypes';
import { STREAM_TYPE } from './constants';

function PlaylistRadioStation(attrs = {}) {
  const seedId = attrs.seedId || encodePlaylistSeedId(attrs.userId, attrs.id);
  const reportingStationType =
    attrs.reportingStationType || STATION_TYPE.PLAYLIST_RADIO;
  Station.call(this, {
    failures: new Map(),
    playlistId: attrs.playlistId || attrs.id,
    reportingStationType,
    seedId,
    seedType: STATION_TYPE.PLAYLIST_RADIO,
    stationType: STATION_TYPE.PLAYLIST_RADIO,
    type: STATION_TYPE.PLAYLIST_RADIO,
    ...attrs,
  });

  this.id = seedId;
  this.set('checkAd', false);
}

PlaylistRadioStation.prototype = Object.create(Station.prototype);
PlaylistRadioStation.prototype.constructor = PlaylistRadioStation;
PlaylistRadioStation.prototype.idAttribute = 'seedId';

PlaylistRadioStation.prototype.getTrackStreamId = function getTrackStreamId() {
  /**
   * WEB-12832
   * Im not sure if this is affected by this.
   * If it is the fix is in the attrs key of this object.
   */
  return {
    streamId: `${this.get('userId')}::${this.get('playlistId')}`,
    streamType: STREAM_TYPE.COLLECTION,
  };
};

PlaylistRadioStation.prototype.getAdStreamId =
  PlaylistRadioStation.prototype.getTrackStreamId;

/**
 * Get the next track, going thru local `tracks` first, then fetch more
 * @param  {Number}   profileId Profile ID
 * @param  {String}   sessionId Session ID
 * @param  {Number=}   trackId   Track ID
 * @param  {Object}   opts      Options
 * @param {Number} opts.playedFrom Played From value
 * @return {Promise} Promise containing track
 */
PlaylistRadioStation.prototype.next = function next(
  profileId,
  sessionId,
  trackId,
  playedFrom,
) {
  // IHRWEB-15411 keeping, but highlighting, for Web-Ads 2.0 implementation (MP):
  return nextCustomTrack(this, profileId, sessionId, trackId, playedFrom);
};

export default PlaylistRadioStation;
