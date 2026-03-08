// # IHR Chromecast Controller
// This one mimics the player interface
import chromecastConstants from './constants';
import CollectionStation from 'web-player/models/Collection';
import CustomStation from 'web-player/models/Custom';
import getArtistSeedFromRadioId from 'shims/getArtistSeedFromRadioId';
import hub, { E } from 'shared/utils/Hub';
import LiveStation from 'web-player/models/Live';
import logger, { CONTEXTS } from 'modules/Logger';
import Media from 'web-player/models/Media';
import Model from 'web-player/models/Model';
import PodcastStation from 'web-player/models/Podcast';
import reduxFactory from 'state/factory';
import Sender from './WebSender';
import transport from 'api/transport';
import watch from 'redux-watch';
import { createStructuredSelector } from 'reselect';
import { getChromecastEnabled } from 'state/Config/selectors';
import {
  getCredentials,
  getDeviceId,
  getProfileId,
} from 'state/Session/selectors';
import { getIsShuffled } from 'state/Playlist/selectors';
import { getStationType } from 'web-player/utils/getStationType';
import { isPlaylist } from 'state/Playlist/helpers';
import { noop, throttle } from 'lodash-es';
import { PLAYER_STATE } from 'constants/playback';
import { showMaxSkipWarning } from 'state/UI/actions';
import { STATION_TYPE } from 'constants/stationTypes';

const store = reduxFactory();

const isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

/**
 * IHR Chromecast Controller. This one mimics the player interface
 * @param {Object} playerEvents Player events that we'd listen to
 * @param {Object} senderConfig Configuration
 */
function MediaChannel(opts = {}) {
  this._ready = false;
  this._state = opts.state;
  this._config = opts.config;
  if (!isChrome || !this._config.appId) return this;
  this.shuffle = this.shuffle.bind(this);

  const credentialsSelector = createStructuredSelector({
    profileId: getProfileId,
  });
  const credentialsWatcher = watch(() => credentialsSelector(store.getState()));

  store.subscribe(
    credentialsWatcher(async ({ profileId }) => {
      const chromecastEnabled = getChromecastEnabled(store.getState());
      if (chromecastEnabled) this.configure(profileId);
    }),
  );
}

MediaChannel.prototype = {
  ...MediaChannel.prototype,
  getState: noop,
  loadSeedStation: noop,
  loadStation: noop,
  mute: noop,
  pause: noop,
  play: noop,
  seek: noop,
  setPlayedFrom: noop,
  setState: noop,
  skip: noop,
  stop: noop,
  thumb: noop,
  unmute: noop,
  volume: noop,
};

// WebPlayer mixin stuff

/**
 * Load a seed station.
 * IMPORTANT: Only works for unauthed live now, for custom, use `loadStation`.
 * The reason is that it doesn't have the mechanism to add station to someone's profile.
 * @param  {Number} seedId       Seed station ID
 * @param  {String} seedType     Seed station type
 * @param  {Object} trackingData Tracking sauce
 * @param  {Object} opts         Options
 * @param  {Number} opts.mediaId Media ID
 * @return {Promise}              [description]
 */
MediaChannel.prototype.loadSeedStation = function loadSeedStation(
  seedId,
  seedType,
  trackingData,
  opts,
) {
  return new LiveStation({
    id: seedId,
  })
    .fetch(undefined, undefined, { state: store.getState() })
    .then(station => this.loadStation(station, trackingData, opts));
};

/**
 * Load a station.
 * @param  {Model} stationModel   Station object
 * @param  {Object} trackingData Tracking sauce
 * @param  {Object} opts         Options
 * @param  {Number} opts.mediaId Media ID
 * @return {Promise}              [description]
 */
MediaChannel.prototype.loadStation = function loadStation(
  stationModel,
  trackingData,
  opts = {},
) {
  if (!stationModel || !opts.autoplay) return Promise.resolve();

  const station = this.switchStation(stationModel);

  const credentials = getCredentials(store.getState());
  const playedFrom = 98;
  const seedId = station.get('seedId');
  const seedType = station.get('seedType');
  const stationInfo = {};
  const trackId = opts.mediaId;
  const type = getStationType(seedType);
  let trackInfo = null;

  switch (seedType) {
    case STATION_TYPE.LIVE:
      stationInfo.id = seedId;
      break;
    case STATION_TYPE.ARTIST:
      stationInfo.artistSeed = seedId;
      break;
    case STATION_TYPE.TRACK:
      stationInfo.trackSeed = seedId;
      break;
    case STATION_TYPE.FEATURED:
      stationInfo.featuredStationId = seedId;
      break;
    case STATION_TYPE.PODCAST:
      stationInfo.seedShow = seedId;
      break;
    case STATION_TYPE.COLLECTION:
    case STATION_TYPE.PLAYLIST_RADIO:
      stationInfo.playlistId = station.get('playlistId');
      stationInfo.userId = station.get('userId');
      stationInfo.shuffled = station.get('playlist').isShuffled;
      break;
    default:
      break;
  }

  if (trackId) {
    trackInfo = { id: trackId };
  }

  if (seedType === STATION_TYPE.COLLECTION) {
    trackInfo =
      trackId ?
        {
          startTime: this.getPosition() || 0,
          uuid: trackId,
        }
      : {};
  }

  stationInfo.type = type;

  this._sender.loadSeedStation(stationInfo, trackInfo, credentials, playedFrom);

  this._state.setPlayingState(PLAYER_STATE.PLAYING);
  // So that this is tracked properly
  hub.trigger(E.STATION_LOADED, station);
  hub.trigger(E.PLAY);
  this.getState().setStation(station);

  return Promise.resolve();
};

/**
 * Reload a station when a media failed to play.
 * @param  {Model} stationModel   Station object
 * @param  {Object} opts         Options
 * @param  {Number} opts.mediaId Media ID
 */
MediaChannel.prototype.reloadStation = function reloadStation(state, station) {
  const opts = { autoplay: true };
  const track = state.get('track');

  if (track) {
    if (station.get('seedType') === STATION_TYPE.COLLECTION) {
      opts.mediaId = track.get('uniqueId');
    } else {
      opts.mediaId = track.get('id');
    }
  }

  this.loadStation(station, null, opts);
};

/**
 * Play the station with a specific track
 */
MediaChannel.prototype.play = function play() {
  const state = this._state;
  const station = state.getStation();

  // We can't resume live so let's just reload it
  if (station.get('seedType') === STATION_TYPE.LIVE) {
    return this.loadStation(station, null, { autoplay: true });
  }

  return this._sender.play(
    () => {
      state.setPlayingState(PLAYER_STATE.PLAYING);
      hub.trigger(E.PLAY);
    },
    err => {
      // If this function was triggered from Chrome browser extension, we may have no media or receiver, try again
      if (
        err.code === chromecastConstants.SESSION_ERROR_CODE ||
        err.code === this._sender.ERROR_NO_MEDIA ||
        err.description === chromecastConstants.SESSION_ERROR_DESCRIPTION
      ) {
        this.reloadStation(state, station);
      } else {
        logger.error(CONTEXTS.CHROMECAST, err, null, new Error(err));
      }
    },
  );
};

MediaChannel.prototype.pause = function pause() {
  return this._sender.pause(() => {
    this._state.setPlayingState('PAUSED');
  });
};

/**
 * Get/set volume
 * @param  {Number} vol
 * @return {Number} current volume if act as setter
 */
MediaChannel.prototype.rawVolume = function rawVolume(vol) {
  if (vol === undefined) {
    this._sender.volume();
    return;
  }

  const volBefore = this._state.getVolume();

  this._state.setVolume(vol);

  this._sender.volume(
    {
      level: vol > 1 ? vol / 100 : vol,
    },
    receiverVol => {
      hub.trigger(E.Chromecast.VOLUME, receiverVol);
    },
    error => {
      logger.error(
        CONTEXTS.CHROMECAST,
        { error, message: 'chromecast volume change failed:' },
        null,
        new Error(error),
      );
      this._state.setVolume(volBefore);
    },
  );
};

MediaChannel.prototype.volume = throttle(MediaChannel.prototype.rawVolume, 250);

/**
 * Mute the receiver
 */
MediaChannel.prototype.mute = function mute() {
  this._sender.volume(
    {
      muted: true,
    },
    () => {
      this._state.setMute(true);
      hub.trigger(E.Chromecast.MUTE, true);
    },
    error => {
      logger.error(
        CONTEXTS.CHROMECAST,
        { error, message: 'chromecast volume change failed:' },
        null,
        new Error(error),
      );
    },
  );
};

/**
 * Unmute the receiver
 */
MediaChannel.prototype.unmute = function unmute() {
  this._sender.volume(
    {
      muted: false,
    },
    () => {
      this._state.setMute(false);
      hub.trigger(E.Chromecast.MUTE, false);
    },
    error => {
      logger.error(
        CONTEXTS.CHROMECAST,
        { error, message: 'chromecast volume change failed:' },
        null,
        new Error(error),
      );
    },
  );
};

MediaChannel.prototype.seek = function seek(time) {
  this._state.setPosition(time);
  return this._sender.seek(time);
};

MediaChannel.prototype.getPosition = function getPosition() {
  return this._state.getPosition();
};

MediaChannel.prototype.getDuration = function getDuration() {
  return this._state.getDuration();
};

MediaChannel.prototype.skip = function skip() {
  const track = this._state.getTrack();
  if (track && track.isSkippable()) {
    this._sender.skip();
    return;
  }
  store.dispatch(showMaxSkipWarning());
};

MediaChannel.prototype.back = function back() {
  const track = this._state.getTrack();
  if (track && track.isSkippable()) {
    this._sender.back();
    return;
  }
  store.dispatch(showMaxSkipWarning());
};

MediaChannel.prototype.restartSong = function restartSong() {
  this.seek(0);
};

MediaChannel.prototype.stop = function stop() {
  this._state.setPlayingState('IDLE');
  return this._sender.stop();
};

MediaChannel.prototype.configure = function configure(userId) {
  this._config.deviceId =
    userId ? `web-${userId}` : getDeviceId(store.getState());
  this._initialize(this._config);
};

MediaChannel.prototype._initialize = function _initialize(config) {
  let available = false;
  let initialized = false;
  // Initialize Sender driver
  this._sender = new Sender(config);

  // Disconnect from Hub when Chromecast disconnects & trigger some tracking events
  this._sender.onDisconnect = () => {
    this._stopListeningToHub();
    hub.trigger(E.Chromecast.DISCONNECTED);
  };

  // Toggle available flag once we have receiver
  this._sender.onReceiverUpdate = avail => {
    available = avail;
    this._ready = available && initialized;
    if (this._ready) {
      hub.trigger(E.Chromecast.READY);
    }
  };

  // Toggle initialized flag once SDK is ready
  this._sender.onChromecastInitialized = () => {
    initialized = true;
    this._ready = available && initialized;
    if (this._ready) {
      hub.trigger(E.Chromecast.READY);
    }
  };

  // When we got a session, start listening to central hub for player actions
  this._sender.onSession = () => {
    hub.trigger(E.Chromecast.CONNECTED);
    this._listenToHub();
  };

  // When Media Info got updated, make sure we reflect that in the UI as well
  this._sender.onMediaStatusUpdate = (media, mediaSessionInfo) => {
    // Custom data contains `track` & `station` which are what we care about since
    // those are enriched AMP object
    const data = media && media.customData;

    if (this._state.isPlaying()) {
      hub.trigger(E.PLAY);
    } else {
      hub.trigger(E.PAUSE);
    }

    if (!data) return;

    const { metadata } = data;
    const {
      trackId,
      trackName,
      trackNumber,
      trackDescription,
      stationId,
      stationName,
      stationImage,
      stationDescription,
      stationType,
    } = metadata;

    let idParam = 'trackId';
    if (stationType === STATION_TYPE.PODCAST) {
      idParam = 'episodeId';
    } else if (stationType === STATION_TYPE.COLLECTION) {
      idParam = 'trackUuid';
    }

    const track = {
      description: trackDescription,
      [idParam]: trackId,
      trackName,
      trackNumber,
      type: stationType === STATION_TYPE.PODCAST ? 'episode' : 'track',
    };

    const station = {
      description: stationDescription,
      id: stationId,
      name: stationName,
      rawLogo: stationImage,
      stationName,
      title: stationName,
      type: stationType,
    };

    if (stationType === STATION_TYPE.CUSTOM) {
      transport(getArtistSeedFromRadioId(stationId))
        .then(
          ({ data: { radioStations } }) =>
            radioStations && radioStations[0].artistSeed,
        )
        .then(seedArtistId => {
          if (!seedArtistId) return;
          this._state.setPlayingState(mediaSessionInfo.playerState);
          if (trackId) {
            this._onTrackLoaded(
              track,
              {
                ...station,
                seedArtistId,
              },
              mediaSessionInfo.position,
            );
          }
        });
    } else {
      this._state.setPlayingState(mediaSessionInfo.playerState);
      if (trackId) {
        this._onTrackLoaded(
          track,
          {
            ...station,
            seedId: stationId,
          },
          mediaSessionInfo.position,
        );
      }
    }
  };

  // When track changes, make sure we reflect that in the UI as well
  this._sender.onTrackChangeMessage = message => {
    const { station, track } = message.data;
    if (!track || !station) return;
    this._onTrackLoaded(track, station);
  };
};

/**
 * Logs the user out
 */
MediaChannel.prototype._logout = function _logout() {
  if (this._ready) this._sender.logout();
};

/**
 * Handle track change
 * @param  {Object} track
 * @param  {Object} station
 */
MediaChannel.prototype._onTrackLoaded = function _onTrackLoaded(
  media,
  stationData,
  position,
) {
  const state = this.getState();
  const currentTrack = state.getTrack();
  let newStation = null;
  let track = new Media(media);

  switch (stationData.type) {
    case STATION_TYPE.LIVE:
      newStation = new LiveStation(stationData);
      break;
    case STATION_TYPE.CUSTOM:
      newStation = new CustomStation(stationData);
      break;
    case STATION_TYPE.PODCAST:
      newStation = new PodcastStation(stationData);
      break;
    case 'playlist':
      // AV - 3/5/18 - WEB-10774
      // TODO: product hasn't prioritized chromecast (so no ticket) but when they do, we basically just need to set newStation to a playlistRadio station object instead of a collection object
      newStation = new CollectionStation(stationData);
      break;
    default:
      break;
  }

  const station = this.switchStation(newStation);

  hub.trigger(E.STATION_LOADED, state.getStation());

  if (!currentTrack || currentTrack.id !== track.id) {
    state.setTrack(track);
  }

  track = state.getTrack();
  const reduxState = store.getState();
  return Promise.all([
    track.fetch(reduxState),
    isPlaylist(station.get('seedType')) ?
      station.fetch(reduxState)
    : station.fetch(undefined, undefined, { state: reduxState }),
  ]).then(() => {
    hub.trigger(E.TRACK_CHANGED, track, state.getStation());
    if (this._timeUpdateInterval) clearInterval(this._timeUpdateInterval);
    if (station.get('seedType') !== STATION_TYPE.LIVE) {
      station.set('track', track);
      if (position) this._state.setPosition(position);
      // Update estimated time every second
      this._timeUpdateInterval = setInterval(() => {
        if (!track) {
          return;
        }

        const currentState = this.getState();

        if (currentState.isIdle()) {
          state.setPlayingState(PLAYER_STATE.PLAYING);
        }

        track.set('position', this._sender.getEstimatedTime());

        if (track) {
          hub.trigger(E.TIME, {
            duration: track.get('duration'),
            position: this._sender.getEstimatedTime(),
          });
        }
      }, 1000);
    } else {
      this._timeUpdateInterval = null;
    }
  });
};

MediaChannel.prototype.shuffle = function shuffle(shuffled) {
  if (!!shuffled !== !!this.shuffled) this._sender.shuffle(shuffled);
  this.shuffled = !!shuffled;
};

MediaChannel.prototype.getState = function getState() {
  return this._state;
};

MediaChannel.prototype.setState = function setState(state) {
  this._state = state;
  return this;
};

/**
 * Starts listening to hub
 */
MediaChannel.prototype._listenToHub = function _listenToHub() {
  hub
    .on(E.PLAYER_REMOVE_STATION, this._onStationRemove, this)
    .on(E.LOGOUT, this._logout, this);
};

let unsubscribe = noop;

MediaChannel.prototype.switchStation = function switchStation(newStation) {
  const state = this.getState();
  const currentStation = state.getStation();
  const currentIsPlaylist =
    currentStation &&
    currentStation instanceof Model &&
    isPlaylist(currentStation.get('seedType'));
  const newIsPlaylist =
    newStation.get && isPlaylist(newStation.get('seedType'));
  let shouldUseNewStation = true;
  if (currentStation) {
    const currentStationId =
      currentIsPlaylist ? currentStation.get('playlistId') : currentStation.id;
    const newStationId =
      newIsPlaylist ? newStation.get('playlistId') : newStation.id;

    shouldUseNewStation =
      !currentStation ||
      currentStationId !== newStationId ||
      currentStation.get('seedType') !== newStation.get('seedType');
  }
  if (shouldUseNewStation) {
    if (currentIsPlaylist) unsubscribe();

    if (newIsPlaylist) {
      const watcher = watch(() =>
        getIsShuffled(store.getState(), {
          seedId: newStation.get('seedId'),
        }),
      );

      unsubscribe = store.subscribe(watcher(this.shuffle));
    }

    state.setStation(newStation);
    return newStation;
  }
  if (currentIsPlaylist) {
    const watcher = watch(() =>
      getIsShuffled(store.getState(), {
        seedId: currentStation.get('seedId'),
      }),
    );

    unsubscribe = store.subscribe(watcher(this.shuffle));
  }

  return currentStation;
};

/**
 * Stops listening to hub
 */
MediaChannel.prototype._stopListeningToHub = function _stopListeningToHub() {
  clearInterval(this._timeUpdateInterval);
  hub
    .off(E.PLAYER_REMOVE_STATION, this._offStationRemove, this)
    .off(E.LOGOUT, this._logout, this);
};

export default MediaChannel;
