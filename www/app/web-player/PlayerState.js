/* WEB-11055 - ZS -
 * This stuff is extended even further within app/utils/PlayerState. So logic related to how playerstate
 * works is split. which isn't great, but what we've got at the moment. Where conflicts exist, app/utils
 * takes precedence
 */
import analytics from 'modules/Analytics';
import hub, { E } from 'shared/utils/Hub';
import localStorage from 'utils/localStorage';
import LocalStorageKeys from 'constants/localStorageKeys';
import Model from 'web-player/models/Model';
import { memoize, merge } from 'lodash-es';
import { STATION_TYPE } from 'constants/stationTypes';

// This class specfically stores player states only.
// Can be extended and pass to Player, as long as it still
// supports all methods in the prototype.

const persistedState = localStorage.getItem(LocalStorageKeys.PlayerState, {
  mute: false,
  volume: 60,
});

const DEFAULT_STATE = {
  // Since ad triggers adcomplete on both complete & skip, need this to avoid
  // double `next`
  isSkipping: false,

  // Currently playing station
  station: null,

  // Currently playing track
  track: null,

  // Current station controller
  controller: null,

  // Playing state (PLAYING, PAUSED, BUFFERING, IDLE)
  playingState: 'IDLE',

  // Current user credentials
  creds: {},

  // Current playlist of tracks
  playlist: [],

  // Global Tracking data
  globalTracking: {},

  // Actual tracking data (change per station)
  tracking: {},

  replayTrack: null,

  // Volume
  volume: persistedState.volume,

  // Whether player was muted
  mute: persistedState.mute,

  // TIME - track position
  position: 0,

  // TIME - track duration
  duration: 0,

  // indicates what track should be passed to _next from onComplete.  Currently only used to set the first track after blank.mp4 when we call startWarmup
  initialTrack: null,

  // 9/14/2017 ZS used to bypass _next logic for the initial preroll
  inInit: true,

  // 7/03/2018 PB used to make sure we hit _next to refresh streamUrl when we come back from network outage
  connectionLost: false,

  // track whether or not track is seeking (either via scrubber or forward/back buttons)
  isSeeking: false,

  // Live metadata
  liveMetaData: null,

  isGraceNoteAdvert: false,
};

// TODO: Issue w/ current player is that it debounces metadata event after 2s so if
// play/pause happens between 2s of each other, it might show the wrong state

function PlayerState() {
  this._storedState = this._load();
  Model.call(this, merge({}, DEFAULT_STATE));
}

PlayerState.prototype = Object.create(Model.prototype);
PlayerState.prototype.constructor = PlayerState;

PlayerState.prototype.STORAGE_KEY = 'ihr-player-state';

PlayerState.prototype.resetRelatedStationInfo =
  function resetRelatedStationInfo() {
    return this.set({
      controller: DEFAULT_STATE.controller,
      isSeeking: DEFAULT_STATE.isSeeking,
      isSkipping: DEFAULT_STATE.isSkipping,
      playingState: DEFAULT_STATE.playingState,
      playlist: DEFAULT_STATE.playlist,
      station: DEFAULT_STATE.station,
      track: DEFAULT_STATE.track,
      tracking: DEFAULT_STATE.tracking,
    });
  };

PlayerState.prototype.getPlayingState = function getPlayingState() {
  return this.get('playingState');
};

PlayerState.prototype.isPlaying = function isPlaying() {
  return this.getPlayingState() === 'PLAYING';
};

PlayerState.prototype.isIdle = function isIdle() {
  return this.getPlayingState() === 'IDLE';
};

PlayerState.prototype.isPaused = function isPaused() {
  return this.getPlayingState() === 'PAUSED';
};

PlayerState.prototype.isBuffering = function isBuffering() {
  return this.getPlayingState() === 'BUFFERING';
};

PlayerState.prototype.isLoading = function isLoading() {
  return this.getPlayingState() === 'LOADING';
};

/**
 * Get the currently loaded station
 * @return {Object} Station object
 */
PlayerState.prototype.getStation = function getStation() {
  return this.get('station');
};

PlayerState.prototype.setStation = function setStation(station) {
  return this.set('station', station);
};

/**
 * Set global tracking variables. Note that this will extend the current tracking,
 * not overwriting it
 * @param {Object} data tracking data
 * @param {String|Number} data.gender User gender
 * @param {Number|null} data.age User age
 * @param {Number} data.terminalid Client terminal ID
 * @param {Number} data.uid Global user UID
 * @param {Number} data.init_id Tracker init
 * @param {Number|null} data.profileid User profileID
 * @param {Boolean} data.fb_broadcast Whether user has fb broadcasting on
 * @param {Number} data.at Not sure what this is
 * @param {String} data.clientType Client type (web/chromecast)
 * @param {String} data.territory Country code (US/AU)
 * @param {String} data.pname Partner name
 * @param {String} data.campid Campaign
 * @param {String} data.cid ???
 * @param {String} data.keyid ???
 */
PlayerState.prototype.setGlobalTracking = function setGlobalTracking(data) {
  const tracking = this.getGlobalTracking();
  return this.set('globalTracking', merge(tracking, data));
};

PlayerState.prototype.getGlobalTracking = function getGlobalTracking() {
  return this.get('globalTracking');
};

PlayerState.prototype.getTracking = function getTracking() {
  return merge({}, this.getGlobalTracking(), this.get('tracking'));
};

PlayerState.prototype.setTracking = function setTracking(trackingData) {
  return this.set('tracking', trackingData);
};

PlayerState.prototype.getController = function getController() {
  return this.get('controller');
};

PlayerState.prototype.setController = function setController(controller) {
  return this.set('controller', controller);
};

PlayerState.prototype.getTrack = function getTrack() {
  return this.get('track');
};

PlayerState.prototype.setVolume = function setVolume(vol) {
  this.set('volume', vol);
};

PlayerState.prototype.getVolume = function getVolume() {
  return this.get('volume');
};

PlayerState.prototype.getMute = function getMute() {
  return this.get('mute');
};

PlayerState.prototype.setMute = function setMute(isMuted) {
  return this.set('mute', isMuted);
};

PlayerState.prototype.setIsGraceNoteAdvert = function setIsGraceNoteAdvert(
  isGraceNoteAdvert,
) {
  return this.set('isGraceNoteAdvert', isGraceNoteAdvert);
};

PlayerState.prototype.getIsGraceNoteAdvert = function getIsGraceNoteAdvert() {
  return this.get('isGraceNoteAdvert');
};

PlayerState.prototype.setTrack = function setTrack(track) {
  const previousTrack = this.getTrack();
  this.set('track', track);
  // this logic is included because it is required for metadata track handling,
  // called in Main.js onMeta.
  // ref: https://jira.ihrint.com/browse/WEB-6676
  return previousTrack && track ?
      previousTrack.get('type') !== track.get('type') ||
        previousTrack.id !== track.id
    : true;
};

PlayerState.prototype.getPlaylist = function getPlaylist() {
  return this.get('playlist');
};

PlayerState.prototype.setPlaylist = function setPlaylist(playlist) {
  return this.set('playlist', playlist, (obj, src) => {
    if (Array.isArray(src)) return src;
    return undefined;
  });
};

PlayerState.prototype.setReplayState = function setReplayState(
  newTrack = this.getTrack(),
) {
  const replayTrack = merge({}, newTrack);
  replayTrack.set('isReplay', true); // this can be used in the UI to display a `now replaying` state.
  replayTrack.set('reported', {}); // reset reporting so tracking calls can happen again.
  this.set('replayTrack', replayTrack);
};

PlayerState.prototype.getReplayState = function getReplayState() {
  return this.get('replayTrack');
};

PlayerState.prototype.resetReplayState = function resetReplayState() {
  this.set('replayTrack', null);
};

PlayerState.prototype.getShuffleReportingState =
  function getShuffleReportingState() {
    return this.get('shuffleReporting');
  };

PlayerState.prototype.setShuffleReportingState =
  function setShuffleReportingState(state) {
    this.set('shuffleReporting', state);
  };

PlayerState.prototype.setInitialTrack = function setInitialTrack(mediaId) {
  this.set('initialTrack', mediaId);
};

PlayerState.prototype.resetInitialTrack = function resetInitialTrack() {
  this.set('initialTrack', null);
};

PlayerState.prototype.getInitialTrack = function getInitialTrack() {
  return this.get('initialTrack');
};

PlayerState.prototype.setConnectionLost = function setConnectionLost() {
  this.set('connectionLost', true);
};

PlayerState.prototype.resetConnectionLost = function resetConnectionLost() {
  this.set('connectionLost', false);
};

PlayerState.prototype.getConnectionLost = function getConnectionLost() {
  return this.get('connectionLost');
};

PlayerState.prototype.setMetaData = function setMetaData(metaData) {
  this.attrs.liveMetaData = metaData;
  hub.trigger(E.LIVE_RAW_META);
};

PlayerState.prototype.getMetaData = function getMetaData() {
  return this.get('liveMetaData');
};

/**
 * Override set function to save to local storage
 */
PlayerState.prototype.set = function set(...args) {
  Model.prototype.set.apply(this, args);
  this._save();
  hub.trigger(E.PLAYER_STATE_UPDATE);
};

/**
 * Save a more simple version of this object to localStorage
 * this is primarily used to load the last played station into the player, which is one of the options
 * in the loadInitialStation queue
 */
PlayerState.prototype._save = function _save() {
  const prevStation = localStorage.getItem(this.STORAGE_KEY, {});

  if (!prevStation.station) prevStation.station = {};
  if (!prevStation.station.get) prevStation.station.get = function get() {};

  // we do not store mymusic playback
  const station = this.getStation() || prevStation.station;

  const state = {
    mute: this.getMute(),
    position: this.getPosition(),
    volume: this.getVolume(),
  };

  // if partialLoad == true, don't save station UNLESS it was already the last played station
  // partialLoad represents stations that are loaded into the player when the first page load happens
  // but haven't actually played anything yet
  if (
    station &&
    (!station.partialLoad || station.id === prevStation.station.id)
  ) {
    state.station = {
      ...(prevStation.station || {}),
      id: station.get('seedId') || station.id,
      type: station.get('seedType') || station.get('type') || station.type,
      userId: station.get('userId'),
    };
  }

  if (station && station.get('seedType') === STATION_TYPE.MY_MUSIC) {
    state.station = {
      ...state.station,
      myMusicType: station.get('myMusicType'),
    };
  }

  localStorage.setItem(this.STORAGE_KEY, state);
};

/**
 * Load state from localStorage
 * @return {Object} resolve if there was a previous station stored
 */
PlayerState.prototype._load = function _load() {
  return localStorage.getItem(this.STORAGE_KEY, {});
};

PlayerState.prototype.getStoredState = function getStoredState() {
  return this._storedState;
};

/**
 * Override reset function
 */
PlayerState.prototype.reset = function reset() {
  this.set(merge({}, DEFAULT_STATE));
  localStorage.removeItem(this.STORAGE_KEY);
};

/**
 * Override this function to trigger hub change
 */
PlayerState.prototype.setPlayingState = function setPlayingState(newState) {
  this.set('playingState', newState);
  hub.trigger(E.PLAY_STATE_CHANGED, this.getPlayingState());
  analytics.setGlobalData({ isPlaying: newState === 'PLAYING' });
};

/**
 * Store the current position in the playing track so the player ui can be
 * reinstantiated correctly.
 */
PlayerState.prototype.setPosition = function setPosition(position) {
  this.set('position', position);
};

PlayerState.prototype.getPosition = function getPosition() {
  return this.get('position');
};

/**
 * Store the current duration emitted by the TIME event.
 */
PlayerState.prototype.setDuration = function setDuration(duration) {
  this.set('duration', duration);
};

PlayerState.prototype.getDuration = function getDuration() {
  return this.get('duration');
};

/**
 * Store the current sentiment in playing track so player ui can be reinstantiated correctly
 */
PlayerState.prototype.setSentiment = function setSentiment(sentiment) {
  this.set('sentiment', sentiment);
};

PlayerState.prototype.getSentiment = function getSentiment() {
  return this.get('sentiment');
};

/**
 * Calls constructor, which loads state from storage.
 * */
PlayerState.getInstance = memoize(() => new PlayerState());

/**
 * Gets a memoized dummy state
 * @return {PlayerState} Dummy state that does not persistence/even triggering or anything
 */
PlayerState.getDummyState = (function getDummyState() {
  let dummy;

  return function iffe() {
    if (!dummy) dummy = new PlayerState();
    dummy.reset();
    return dummy;
  };
})();

export default PlayerState;
