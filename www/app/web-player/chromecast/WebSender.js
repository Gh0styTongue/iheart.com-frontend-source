// # Web Sender Driver
// Driver layer to Chromecast Web Sender. After intializing you can set
// onSession, onChromecastFailure, onSessionError, onMessage, onDisconnect, onReceiverUpdate

import factory from 'state/factory';
import getScript from 'utils/getScript';
import logger, { CONTEXTS } from 'modules/Logger';
import { noop } from 'lodash-es';
import { showMaxSkipWarning } from 'state/UI/actions';
import { v4 as uuid } from 'uuid';

let castApi;
const store = factory();

/**
 * Web Sender Driver
 * @param {Object} config Configuration object
 * @param {Number=} [config.deviceId=Current_millis] Device ID
 * @param {String} config.appId Application
 * @param {String} [config.deviceType=web] Device type
 * @param {Object=} config.subscribedEvents Subscribed events
 */
function Sender(config = {}) {
  this.id = config.deviceId || uuid();
  this.deviceType = config.deviceType || 'web';
  if (config.appId) this.CAST_APP_ID = config.appId;
  this.requestIdCounter = 0;

  this._subscribedEvents = config.subscribedEvents || {
    LIVE_METADATA: 1,
    SKIPINFO: 1,
    TIME_UPDATE: 1,
    TRACK_CHANGE: 1,
  };

  this._handleMessage = this._handleMessage.bind(this);
  this._handleSession = this._handleSession.bind(this);
  this._onSessionResume = this._onSessionResume.bind(this);

  this.ready = new Promise((resolve, reject) => {
    window.__onGCastApiAvailable = (loaded, errorInfo) => {
      // Cast is not loaded, bail
      if (!loaded) return reject(errorInfo);

      castApi = window.chrome.cast;

      // Do the cast SDK dance
      const sessionRequest = new castApi.SessionRequest(this.CAST_APP_ID);
      const apiConfig = new castApi.ApiConfig(
        sessionRequest,
        this._onSessionResume,
        availability => {
          // Trigger receiver update callback
          this.onReceiverUpdate(
            availability === castApi.ReceiverAvailability.AVAILABLE,
          );
        },
      );

      castApi.initialize(
        apiConfig,
        (...args) => this.onChromecastInitialized(...args),
        (...args) => this.onChromecastFailure(...args),
      );

      return resolve(loaded);
    };

    window.addEventListener('load', () =>
      getScript('//www.gstatic.com/cv/js/sender/v1/cast_sender.js'),
    );
  });
}

// ## Public Methods
/**
 * APP IDs
 * dev1    : D5050072
 * qa/stage: 2A967391
 * prod    : 7F8E0EF3
 */
Sender.prototype.CAST_APP_ID = '7F8E0EF3';
Sender.prototype.NAMESPACE = 'urn:x-cast:com.google.cast.media';
Sender.prototype.ERROR_NO_MEDIA = 'no_media';

Sender.prototype.getEstimatedTime = function getEstimatedTime() {
  if (this.session.media && this.session.media.length) {
    return this.session.media[0].getEstimatedTime();
  }
  return 0;
};

/**
 * Trigger play on media channel
 * @param  {Function} successCb Success callback
 * @param  {Function} errorCb   Error callback
 */
Sender.prototype.play = function play(successCb = noop, errorCb = noop) {
  if (this.mediaSession) {
    this.mediaSession.play(null, successCb, errorCb);
    return;
  }
  const err = { code: this.ERROR_NO_MEDIA };
  errorCb(err);
};

/**
 * Trigger pause on media channel
 * @param  {Function} successCb Success callback
 * @param  {Function} errorCb   Error callback
 */
Sender.prototype.pause = function pause(successCb = noop, errorCb = noop) {
  return this.mediaSession.pause(null, successCb, errorCb);
};

/**
 * Trigger stop on media channel
 * @param  {Function} successCb Success callback
 * @param  {Function} errorCb   Error callback
 */
Sender.prototype.stop = function stop(successCb = noop, errorCb = noop) {
  return this.mediaSession.stop(null, successCb, errorCb);
};

/**
 * Send THUMBS_UP to custom channel
 */
Sender.prototype.thumbUp = function thumbUp() {
  this._message({
    type: 'THUMBS_UP',
  });
};

/**
 * Send THUMBS_DOWN to custom channel
 */
Sender.prototype.thumbDown = function thumbDown() {
  this._message({
    type: 'THUMBS_DOWN',
  });
};

/**
 * Send SKIP to custom channel
 */
Sender.prototype.skip = function skip() {
  if (this.session.media && this.session.media.length) {
    this.session.media[0].queueNext(null, err => {
      if (err.description && err.description === 'SKIP_LIMIT_REACHED') {
        store.dispatch(showMaxSkipWarning());
      }
    });
  }
};

/**
 * Send back to custom channel
 */
Sender.prototype.back = function back() {
  if (this.session.media && this.session.media.length) {
    this.session.media[0].queuePrev(null, err =>
      logger.error(CONTEXTS.CHROMECAST, err, null, new Error(err)),
    );
  }
};

/**
 * Send VARIETY to custom channel
 * @param  {Number} [val=1] variety value
 */
Sender.prototype.variety = function variety(val = 1) {
  this._message({
    type: 'VARIETY',
    value: val,
  });
};

/**
 * Send LOGOUT to custom channel
 */
Sender.prototype.logout = function logout() {
  this._message({
    type: 'LOGOUT',
  });
};
/**
 * Send shuffle to customChannel
 */
Sender.prototype.shuffle = function shuffle(shuff) {
  this.requestIdCounter += 1;
  const shuffleRequest = {
    customData: {
      sessionId: this.session.sessionId,
      shuffle: !!shuff,
    },
    mediaSessionId: this.mediaSession.mediaSessionId,
    requestId: this.requestIdCounter,
    type: 'QUEUE_UPDATE',
  };
  this._message(shuffleRequest);
};

/**
 * Send SEEK to custom channel, seek to a specific position
 * @param  {Number} position Seconds to seek to
 */
Sender.prototype.seek = function seek(position) {
  const seekRequest = new castApi.media.SeekRequest();
  seekRequest.currentTime = position;
  if (this.session.media && this.session.media.length) {
    this.session.media[0].seek(seekRequest, null, err =>
      logger.error(CONTEXTS.CHROMECAST, err, null, new Error(err)),
    );
  }
};

/**
 * Set/get the curent volume
 * @param  {Object} vol object containing `level` (0 - 1.0) and/or `muted`
 * @param {Number} vol.level volume level (0 - 1.0)
 * @param {Boolean} vol.muted True for mute, false otherwise
 * @param {Function} successCb Success function
 * @param {Function} errorCb Error function
 * @return {Number|undefined}     Current volume if getter
 */
Sender.prototype.volume = function volume(vol, successCb, errorCb) {
  if (vol === undefined) return this.mediaSession.volume;
  if (!this.session) return undefined;

  // always set mute (if volume is changing, unmute)
  return this.session.setReceiverMuted(
    vol.muted || false,
    () => {
      if (vol.level === 0 || !!vol.level) {
        this.session.setReceiverVolumeLevel(
          vol.level,
          () => successCb(vol.level),
          errorCb,
        );
      } else {
        successCb();
      }
    },
    errorCb,
  );
};

/**
 * Load a seed station
 * @param  {Object} stationInfo Station info
 * @param {Number=} stationInfo.id Live station ID
 * @param {Number=} stationInfo.artistSeed Artist ID
 * @param {Number=} stationInfo.trackSeed Track ID
 * @param {Number=} stationInfo.featuredStationId Featured station ID
 * @param {Number=} stationInfo.seedShow Talk Show ID
 * @param  {Object} trackInfo   Track info
 * @param {Number} trackInfo.id Track ID
 * @param {Number=} trackInfo.position position to seek to
 * @param  {Object} userInfo    User info
 * @param {Number} userInfo.profileId AMP user profile ID
 * @param {String} userInfo.sessionId AMP user session ID
 * @param  {Number} playedFrom
 */
Sender.prototype.loadSeedStation = function loadSeedStation(
  stationInfo,
  trackInfo,
  userInfo,
) {
  const customData = {
    stationInfo: {
      id: String(
        stationInfo.id ||
          stationInfo.artistSeed ||
          stationInfo.seedShow ||
          stationInfo.playlistId,
      ),
      type: stationInfo.type === 'talk' ? 'podcast' : stationInfo.type,
    },
    userInfo: {
      profileId: userInfo.profileId,
      sessionId: userInfo.sessionId,
    },
    ...(trackInfo ? { trackInfo } : {}),
    ...(stationInfo.userId ? { profileInfo: { id: stationInfo.userId } } : {}),
  };
  switch (stationInfo.type) {
    case 'playlist_radio':
      this._createQueueRequest(customData, stationInfo.shuffled);
      break;
    default:
      this._createRegularRequest(customData);
      break;
  }
};

/**
 * Request a cast session
 * @param  {Function} cb Callback
 */
Sender.prototype.requestSession = function requestSession(cb) {
  castApi.requestSession(
    session => {
      this._handleSession(session);
      if (cb) cb();
    },
    (...args) => this.onSessionError(...args),
  );
};

/**
 * Check if mediaSession is playing
 * @return {Boolean} True if playing, false otherwise
 */
Sender.prototype.isPlaying = function isPlaying() {
  if (!this.mediaSession) return false;

  return (
    this.mediaSession.playerState === castApi.media.PlayerState.PLAYING ||
    this.mediaSession.playerState === castApi.media.PlayerState.BUFFERING
  );
};

// ### Placeholders for handler functions
Sender.prototype.onSession = noop;
Sender.prototype.onSessionError = noop;
Sender.prototype.onMessage = noop;
Sender.prototype.onDisconnect = noop;
Sender.prototype.onMediaStatusUpdate = noop;
Sender.prototype.onReceiverUpdate = noop;
Sender.prototype.onChromecastFailure = noop;
Sender.prototype.onChromecastInitialized = noop;
Sender.prototype.onMessageError = noop;
Sender.prototype.onMessageLiveMetadata = noop;

/**
 * Handle different message types from custom channel & trigger corresponding callbacks
 * @param  {String} namespace Cast iHeart namespace
 * @param  {String} message   Cast message
 */
Sender.prototype._handleMessage = function _handleMessage(namespace, msg) {
  const message = JSON.parse(msg);
  const { data } = message;
  switch (message.type) {
    case 'TRACK_CHANGE':
      this.onTrackChangeMessage(message);
      return this.onMessage(message);
    case 'ERROR':
      return this.onMessageError(message);
    case 'LIVE_METADATA':
      return this.onMessageLiveMetadata(data);
    default:
      return this.onMessage(message);
  }
};

/**
 * Handle session when it's available
 * @param  {CastSession} session
 */
Sender.prototype._handleSession = function _handleSession(session) {
  this.session = session;
  this.session.addUpdateListener(available => {
    if (!available) this.onDisconnect(false);
  });
  // Identify ourselves
  this.session.sendMessage(
    this.NAMESPACE,
    {
      data: {
        deviceId: this.id || this.session.transportId,
        deviceName: 'web',
        deviceType: this.deviceType,
        subscribedEvents: this._subscribedEvents,
      },
      type: 'DEVICE_INFO',
    },
    () => {
      this.session.addMessageListener(this.NAMESPACE, this._handleMessage);
      this.onSession(session);
    },
    error => {
      logger.error(CONTEXTS.CHROMECAST, error, null, new Error(error));
      throw error;
    },
  );
};

/**
 * Handle session resume
 * @param  {CastSession} session
 */
Sender.prototype._onSessionResume = function _onSessionResume(session) {
  if (session.media && session.media.length) {
    this._mediaDiscovered('resume', session.media[0]);
  }
  this._handleSession(session);
};

Sender.prototype._createQueueRequest = function _createQueueRequest(
  data,
  shuffled,
) {
  const castSession = this.session;
  const mediaInfo = new castApi.media.MediaInfo('', '');

  const item = new castApi.media.QueueItem(mediaInfo);
  item.customData = data;
  const request = new castApi.media.QueueLoadRequest([item]);
  request.repeatMode =
    shuffled ?
      castApi.media.RepeatMode.ALL_AND_SHUFFLE
    : castApi.media.RepeatMode.ALL;
  castSession.queueLoad(
    request,
    this._mediaDiscovered.bind(this, 'queueLoad'),
    error => {
      logger.error(CONTEXTS.CHROMECAST, error);
      throw error;
    },
  );
};

/**
 * Create a LOAD request for media channel
 * @param  {Object} data Custom load data
 */
Sender.prototype._createRegularRequest = function _createRegularRequest(data) {
  const castSession = this.session;
  const mediaInfo = new castApi.media.MediaInfo('', '');
  const request = new castApi.media.LoadRequest(mediaInfo);
  request.autoplay = true;
  request.customData = data;
  castSession.loadMedia(
    request,
    this._mediaDiscovered.bind(this, 'loadMedia'),
    error => {
      logger.error(CONTEXTS.CHROMECAST, error, null, new Error(error));
      throw error;
    },
  );
};

/**
 * Get media session state
 * @return {Object} Media session state
 */
Sender.prototype._getMediaSessionState = function _getMediaSessionState(
  mediaSession,
) {
  if (!mediaSession) return null;
  return {
    customData: mediaSession.customData,
    playerState: mediaSession.playerState,
    position: mediaSession.currentTime,
    volume: mediaSession.volume,
  };
};

/**
 * Handler for when media got discovered
 * @param  {String} how          Reason of discovery (resume...)
 * @param  {CastMediaSession} mediaSession
 */
Sender.prototype._mediaDiscovered = function _mediaDiscovered(
  how,
  mediaSession,
) {
  this.mediaSession = mediaSession;
  mediaSession.addUpdateListener(() => {
    this.onMediaStatusUpdate(
      mediaSession.media,
      this._getMediaSessionState(mediaSession),
    );
  });
  this.onMediaStatusUpdate(
    mediaSession.media,
    this._getMediaSessionState(mediaSession),
  );
};

/**
 * Send a message to custom channel
 * @param  {Object} message
 */
Sender.prototype._message = function _message(message) {
  this.session.sendMessage(this.NAMESPACE, message);
};

export default Sender;
