// # Web Player Controller
// Main entry point
import * as reporting from 'services/reporting';
import analytics, { Events } from 'modules/Analytics';
import CollectionController from './controllers/Collection';
import CustomController from './controllers/Custom';
import gracenote from './Gracenote';
import hub, { E } from 'shared/utils/Hub';
import JWDriver from './jwplayer';
import LiveController from './controllers/Live';
import logger, { CONTEXTS } from 'modules/Logger';
import Media from 'web-player/models/Media';
import metadataString from 'utils/playerUtils/metadataString';
import PLAYED_FROM from 'modules/Analytics/constants/playedFrom';
import PlayerState from './PlayerState';
import PodcastController from './controllers/Podcast';
import reduxFactory from 'state/factory';
import replayStore from 'web-player/replay';
import trackers from 'trackers';
import transport from 'api/transport';
import UrlParse from 'url-parse';
import watch from 'redux-watch';
import { get as _get, cloneDeep, omit, throttle } from 'lodash-es';
import {
  adsFreeCustomSelector,
  getSubscriptionType,
} from 'state/Entitlements/selectors';
import {
  COLLECTION_TYPES,
  CUSTOM_TYPES,
  STATION_TYPE,
} from 'constants/stationTypes';
import { ConnectedModals } from 'state/UI/constants';
import { customInstreamEmitter } from 'ads/shims/CustomInStreamAd';
import { getAmpUrl } from 'state/Config/selectors';
import {
  getCredentials,
  getIsLoggedOut,
  getSession,
} from 'state/Session/selectors';
import {
  getCurrentlyLoadedUrl,
  getIsWarmingUp,
  hasSkips,
} from 'state/Player/selectors';
import {
  getCurrentlyPlayingEpisodeDuration,
  getCurrentlyPlayingEpisodePosition,
} from 'state/Podcast/selectors';
import { getCustomAdsEnabled } from 'state/Ads/selectors';
import { getMessage as getGrowlMessage } from 'components/Growls/variants/PlayerErrorGrowl/helpers';
import { getIsAdBlocked } from 'state/UI/selectors';
import { getIsOwnedAndOperated } from 'state/Live/selectors';
import { getMuted, getVolume } from 'state/Playback/selectors';
import {
  getPIICompliantTrackingParams,
  MANDATORY_TRITON_PARAMS,
  processStreamUrl,
} from './utils/streamUrl';
import { getPivotGeoEnabled } from 'state/Features/selectors';
import { getPlayerAnalyticsData } from 'modules/Analytics/legacyHelpers';
import { getProfile } from 'state/Profile/selectors';
import { getTrackByTrackId } from 'state/Tracks/services';
import { JW_ERRORS, PlayerUIErrors } from './constants';
import {
  live as mapLiveStationAnalytics,
  mapStationToAnalyticsData,
} from 'modules/Analytics/helpers/stationMappers';
import { matchProtocol } from 'state/Player/helpers';
import {
  openModal,
  openSignupModal,
  showMaxSkipWarning,
  showPlaybackNetworkErrorGrowl,
  showPlayerErrorGrowl,
} from 'state/UI/actions';
import { PLAYER_STATE } from 'constants/playback';
import { PlayerError } from './utils/errors';
import { PlayerErrorType } from 'modules/Player/constants/playerState';
import { receiveLiveMetaData } from 'state/Live/actions';
import {
  setCurrentlyLoadedUrl,
  setIsWarmingUp,
  setPlayerInteracted,
  setSkips,
  setStationLoaded,
} from 'state/Player/actions';
import { setTFCDAge } from 'state/Ads/actions';
import { slugify } from 'utils/string';
import { trackIsSong } from 'utils/playerUtils';
import { updatePodcastPlayProgress } from 'state/Podcast/actions';

const store = reduxFactory();

const isAdBlocked = () => getIsAdBlocked(store.getState());

function setReported(track, key) {
  if (track)
    track.set('reported', { ...track.get('reported'), [key]: Date.now() });
}
class IHRPlayer {
  constructor() {
    // TODO: if we make it so you can log in without refreshing, then this variable needs to update

    this._next = this._next.bind(this);
    this._playlist = this._playlist.bind(this);
    this._triggerError = this._triggerError.bind(this);
    this.checkActiveStreamer = this.checkActiveStreamer.bind(this);

    // If we're passed a subclass of PlayerState, use that
    // otherwise fall back to empty state
    this._state = PlayerState.getInstance();

    // Setup station controllers
    this._controllers = {};

    const collectionController = new CollectionController();
    const customController = new CustomController();
    // Initialize controllers
    this._setController(STATION_TYPE.LIVE, new LiveController());
    this._setController(STATION_TYPE.CUSTOM, customController);
    this._setController(STATION_TYPE.PLAYLIST_RADIO, customController);
    this._setController(STATION_TYPE.COLLECTION, collectionController);
    this._setController(STATION_TYPE.ALBUM, collectionController);
    this._setController(STATION_TYPE.MY_MUSIC, collectionController);
    this._setController(STATION_TYPE.PODCAST, new PodcastController());

    this._player = new JWDriver(this._getPlayerConfig());

    this._handleHubEvents();

    // Bind Player (driver) API
    // (ad 08/03/2016) TODO - this is where we'll be cleaning up a lot of the playback logic

    /**
     * Since we are starting to add OD features to non-owned and operated
     * stations, we need a way to inject said stations with metadata. We do this
     * by utilizing Gracenote. For these types of stations, we need to poll an
     * amp endpoint about once every 5 seconds. Because of this performance
     * overhead, we elected to move this processing into a web worker. This
     * subscription takes the data and updates the track data of the currently
     * playing station.
     * Developer: Mark Holmes
     * Date: 04/06/2018
     * Reference: https://jira.ihrint.com/browse/WEB-10902
     */
    gracenote.subscribe(data => {
      const currentState = this.getState();
      const currentTrack = currentState.getTrack();
      const track = new Media(data);

      if (
        currentTrack &&
        track &&
        currentTrack.get('trackTitle') === track.get('trackTitle')
      )
        return;

      const trackId = !!track && track.get('id');

      if (trackId && trackId > -1) {
        this.getLyricsId(trackId).then(lyricsId => {
          track.set('lyricsId', lyricsId);
          currentState.setTrack(track);
          currentState.setIsGraceNoteAdvert(false);
          hub.trigger(E.TRACK_CHANGED, track, currentState.getStation());
        });
      } else {
        currentState.setIsGraceNoteAdvert(true);
        currentState.setTrack(track);
        hub.trigger(E.TRACK_CHANGED, track, currentState.getStation());
      }
    });

    const volumeWatcher = watch(() => getVolume(store.getState()));
    const muteWatcher = watch(() => getMuted(store.getState()));

    store.subscribe(volumeWatcher(volume => this.volume(volume)));

    store.subscribe(
      muteWatcher(shouldMute => {
        if (shouldMute) this.mute();
        else this.unmute();
      }),
    );
  }

  getLyricsId(trackId) {
    const ampUrl = getAmpUrl(store.getState());
    return transport(getTrackByTrackId({ ampUrl, trackId }))
      .then(({ data }) => data.track)
      .then(({ lyricsId }) => lyricsId);
  }

  // this should not be done here, but we're forced to put it here because of what's going on in weblibjs now
  hasSkipPrivilege() {
    return false; // no-op, gets overriden when using this class
  }

  /**
   * Load a seed station based on type, ID
   * @param  {E.STATION_TYPE} seedType Type of seed. Will throw error if seedType is
   * not 1 of those we support
   * @param  {Number} seedId     ID of seed
   * @param  {Object} trackingData Tracking object
   * @param {Object} trackingData.listenerId Adswizz Listener ID
   * @param {Array<Number>} trackingData.ccauds Adswizz ccauds
   * @param {Number} trackingData.playedFrom Played From
   * @param  {Object} opts       Additional params/options
   * @param  {Number} opts.mediaId Episode/Track ID
   * @return {Promise}           A Promise that will be resolved w/ station once player loaded the stream
   */
  loadSeedStation(seedId, seedType, trackingData, opts = {}) {
    const currentState = this.getState();
    const currentStation = currentState.getStation();
    const creds = getCredentials(store.getState());

    const { profileId, sessionId } = creds;
    let type = null;

    // Indicate we're loading the station
    currentState.setPlayingState(PLAYER_STATE.LOADING);

    // Let's try to resolve the seed type
    switch (seedType) {
      case STATION_TYPE.LIVE:
        type = 'live';
        break;
      case STATION_TYPE.ARTIST:
      case STATION_TYPE.TRACK:
      case STATION_TYPE.FEATURED:
        type = 'custom';
        break;
      case STATION_TYPE.PODCAST:
        type = 'talk';
        break;
      default:
        // If we can't resolve the type, GTFO
        return Promise.reject(
          new PlayerError(
            'INVALID_SEED_TYPE',
            `${seedType} seed is not supported`,
          ),
        );
    }

    // If this station is already loaded, resolve it right away
    if (
      currentStation &&
      currentStation.get('seedType') === seedType &&
      currentStation.get('seedId') === seedId
    ) {
      if (!currentStation.partialLoad) {
        return this.loadStation(currentStation, trackingData, opts);
      }

      currentStation.partialLoad = false;
    }

    return this._controllers[type]
      .loadSeedStation(seedId, seedType, profileId, sessionId, opts)
      .then(stationModel => this.loadStation(stationModel, trackingData, opts));
  }

  /**
   * Load a station from user history (not a seed).
   * This is the next step after PlayerController#_createRadio, and loads up the station into the player
   * it assumes basically nothing other than a valid station is pushed in and will fetch, several times
   * @param  {weblib.models.Station/Object} station    The full station object from history
   * @param  {Object} trackingData Tracking object
   * @param {Object} trackingData.listenerId Adswizz Listener ID
   * @param {Array<Number>} trackingData.ccauds Adswizz ccauds
   * @param {Number} trackingData.playedFrom Played From
   * @param  {Object} opts       Additional params/options
   * @param {Number} opts.mediaId Episode/Track ID
   * @param {Boolean} opts.autoplay Whether to autoplay after load
   * @return {Promise}           A Promise that will be resolved once player loaded the stream
   */
  // eslint-disable-next-line consistent-return
  loadStation(stationModel, trackingData, opts = {}) {
    const currentState = this.getState();
    const currentStation = currentState.getStation();
    const creds = getCredentials(store.getState());
    const playerTracking = currentState.getTracking();
    const track = currentState.getTrack();
    let type = null;

    // Make sure we're using the passed in trackingData(playedFrom) when available
    const tracking = { ...playerTracking, ...trackingData };

    // Falsy stationModel, come on...
    if (!stationModel) {
      return Promise.reject(
        new PlayerError(
          'INVALID_PARAMETERS',
          "stationModel shouldn't be falsy",
        ),
      );
    }

    // Indicate we're loading the station
    currentState.setPlayingState(PLAYER_STATE.LOADING);

    // Supports both Object & weblib.models.Station
    if (stationModel.get) {
      type = stationModel.get('type');
    } else {
      type = stationModel.type;
    }

    const controller = this._controllers[type];

    // Unsupported type
    if (!controller) {
      return Promise.reject(
        new PlayerError(
          'INVALID_SEED_TYPE',
          `${type} station type is not supported`,
        ),
      );
    }

    // if we are choosing another track within same
    // podcast/playlist/album station then report as SKIP vs STATIONCHANGE
    const reportFunction =
      currentStation && currentStation.id === stationModel.id ?
        reporting.reportSkip
      : reporting.reportStationChange;
    this.callReporting(
      reportFunction,
      'done',
      {
        auth: { ...tracking, ...creds },
        data: reporting.trackDataPicker(track),
        position: this._player.getPosition(),
        shuffle: this.getState().getShuffleReportingState(),
      },
      track,
    );

    if (currentStation) {
      // Reset this flag for the loaded station
      currentStation.set('played', false);
    }

    // Reset player state
    this.stop();
    currentState.resetRelatedStationInfo();

    // Set the new controller
    currentState.setController(controller);

    const currentStationId = currentStation ? currentStation.id : null;
    const currentStationType =
      currentStation ? currentStation.get('seedType') : null;

    const loadedStationType = stationModel.get('seedType');
    const stationHasChanged = !(
      stationModel.id === currentStationId &&
      loadedStationType === currentStationType
    );
    if (loadedStationType !== STATION_TYPE.LIVE || stationHasChanged) {
      stationModel.set('isNew', true);
    }

    if (stationHasChanged) {
      currentState.setPlaylist([]);
      this.changeTrack(undefined, stationModel);
      this._playerPosition = null;
    }

    if (opts.partialLoad) {
      currentState.setStation(
        Object.assign(stationModel, { partialLoad: true }),
      );
      store.dispatch(setStationLoaded());
    } else {
      if (stationModel.partialLoad) {
        stationModel.partialLoad = false; // eslint-disable-line no-param-reassign
      }
      currentState.setStation(stationModel);
    }
    // Process tracking data & save it
    currentState.setTracking(trackingData);
    hub.trigger(E.STATION_LOADED, stationModel);

    if (opts.autoplay) {
      this._next(opts.mediaId);
    }

    /**
     * Everytime we load a new station, we clear any current metadata
     * subscriptions then we dispatch this information to the metadata worker
     * so it can determine whether or not the track needs to be updated for the
     * given live, non-owned and operated station.
     * Developer: Mark Holmes
     * Date: 04/06/2018
     * Reference: https://jira.ihrint.com/browse/WEB-10902
     */
    gracenote.dispatch(stationModel.toJSON());
  }

  play() {
    return this._togglePlay(true);
  }

  pause() {
    if (!this.getState().get('shouldTrackStreamStart')) {
      const currentState = this.getState();
      const station = currentState.getStation();
      const track = currentState.getTrack();

      analytics.track(
        Events.Pause,
        mapStationToAnalyticsData({
          station,
          currentTrack: track,
          profileId: currentState.get('creds').profileId,
        }),
      );

      analytics.track(
        Events.StreamEnd,
        getPlayerAnalyticsData(this.getState(), store.getState(), 'stop'),
      );
      trackers.track(Events.Pause);
    }
    return this._togglePlay(false);
  }

  volume(volume) {
    return volume ? this._player.setVolume(volume) : this._player.getVolume();
  }

  seek(time) {
    const currentState = this.getState();
    currentState.set('isSeeking', true);
    return this._player.seek(time);
  }

  getPosition() {
    return this._player.getPosition();
  }

  getDuration() {
    return this._player.instance.getDuration();
  }

  /**
   * Skip the currently playing track/stream
   * @return {Promise} Promise containing the next track
   */
  skip() {
    const currentState = this.getState();
    const controller = currentState.getController();
    const station = currentState.getStation();
    const creds = getCredentials(store.getState());
    const tracking = currentState.getTracking();
    const track = currentState.getTrack();
    const currentTrackIsReplay = !!track && track.get('isReplay');

    // No active controller?
    if (!controller) {
      return Promise.reject(
        new PlayerError('INVALID_STATE', 'No active controller'),
      );
    }

    if (currentTrackIsReplay) {
      if (!currentState.get('shouldTrackStreamStart')) {
        analytics.track(
          Events.StreamEnd,
          getPlayerAnalyticsData(this.getState(), store.getState(), 'skip'),
        );
      }
    }

    // This controller doesn't support skip
    if (!controller.supportSkip && !currentTrackIsReplay) {
      return Promise.reject(
        new PlayerError(
          'UNSUPPORTED_FEATURE',
          'Current controller does not support skip',
        ),
      );
    }

    // If we can skip, go ahead
    if (track && (hasSkips(store.getState()) || this.hasSkipPrivilege())) {
      currentState.set('isSkipping', true);

      analytics.track(
        Events.Skip,
        mapStationToAnalyticsData({
          station,
          currentTrack: track,
          profileId: currentState.get('creds').profileId,
        }),
      );

      this.callReporting(
        reporting.reportSkip,
        'done',
        {
          auth: { ...tracking, ...creds },
          data: reporting.trackDataPicker(track),
          position: this._player.getPosition(),
          shuffle: this.getState().getShuffleReportingState(),
        },
        track,
      );
      return this._next();
    }
    if (!track) {
      return this._next();
    }

    // We're at the limit, let's reject it
    store.dispatch(showMaxSkipWarning());
    return Promise.reject(
      new PlayerError('INVALID_STATE', 'Skip limit is reached'),
    );
  }

  /**
   * Stop the player
   */
  stop() {
    const currentState = this.getState();
    const playingState = currentState.getPlayingState();

    if (
      playingState === PLAYER_STATE.PLAYING ||
      playingState === PLAYER_STATE.BUFFERING ||
      playingState === PLAYER_STATE.PAUSED
    ) {
      hub.trigger(E.STOP);
      this._player.stop();
      if (!currentState.get('shouldTrackStreamStart')) {
        const station = currentState.getStation();

        analytics.track(Events.Stop, mapLiveStationAnalytics({ station }));

        analytics.track(
          Events.StreamEnd,
          getPlayerAnalyticsData(this.getState(), store.getState(), 'stop'),
        );
        trackers.track(Events.Stop);
      }
    }
    return this;
  }

  getState() {
    return this._state;
  }

  setState(state) {
    this._state = state;
    return this;
  }

  mute() {
    trackers.track(Events.Mute);
    return this._player.mute();
  }

  unmute({ isWarmingUp = false } = {}) {
    const playingState = this.getState().getPlayingState();
    trackers.track(Events.Unmute, { isWarmingUp, playingState });

    return this._player.unmute();
  }

  setPlayedFrom(playedFrom) {
    const state = this.getState();
    const currentTracking = state.getTracking();
    state.setTracking({ ...currentTracking, playedFrom });
  }

  updatePodcastTimeElapsed = throttle(() => {
    const position = this._state?.get('position');
    const podcastId = this._state?.get('station').id;
    const episodeId = this._state?.get('station')?.get('track')?.get('id');
    store.dispatch(updatePodcastPlayProgress(position, podcastId, episodeId));
  }, 30000);

  /**
   * Load a raw URL
   * @param  {String} streamUrl Stream URL
   * @param  {String} type      Stream type (hls, rtmp, aac...)
   */
  _loadUrl(streamUrl, type) {
    const xStreamUrl = matchProtocol(streamUrl);
    store.dispatch(setCurrentlyLoadedUrl(xStreamUrl));
    this._player.loadUrl(xStreamUrl, type);
    this._playerPosition = null;
    return this;
  }

  /**
   * Load & play the next track in the playlist.
   * The infamous _next. This is a central point for this file, and virtually all other methods run through
   * here. Believe nothing, and even with comments, your best debugging strategy is to drop a breakpoint in
   * and step through individually. 99% of the time this is the fastest thing and allows for triaging and
   * triangulation to the correct result. Comments will get out of date, since the relationships are
   * inobvious and not necessarily testable across all scenarios
   * @param {Number} trackId Force player to load a certain track, specifically for on-demand episode playback
   * @return {weblib.models.Media} Track about to be played
   */
  _next(trackId) {
    const currentState = this.getState();
    const station = currentState.getStation();
    const currentTrack = currentState.getTrack();
    const currentTrackIsReplay = !!currentTrack && currentTrack.get('isReplay');
    const trackingInfo = currentState.getTracking();
    const playlist = currentState.getPlaylist();
    const replayTrack = currentState.getReplayState();
    const newTrackId = parseInt(trackId, 10);
    const requiresRegister =
      _get(station, ['attrs', 'feed', 'regGate'], null) === 'true';
    const stationType = _get(station, ['attrs', 'type'], null);
    const liveReplayResume = currentTrackIsReplay && stationType === 'live';
    const reduxState = store.getState();
    const creds = getCredentials(reduxState);
    const { profileId, sessionId } = creds;

    if (station && station.partialLoad) return undefined;
    // as with _createRadio, this should be moved up to the invocation point, since we should know
    // whether or not this is available long before this point
    currentState.set('inInit', false);

    if (getIsLoggedOut(reduxState) && requiresRegister) {
      store.dispatch(openSignupModal({ context: 'reg-gate' }));
      return false;
    }

    // this _next call has a replay track queued up and ready to start
    // play the replay track
    if (replayTrack) {
      if (!currentState.get('shouldTrackStreamStart')) {
        analytics.track(
          Events.StreamEnd,
          getPlayerAnalyticsData(this.getState(), store.getState(), 'replay'),
        );
      }
      return this._handleReplay();
    }

    // we're a custom station, so we should make sure that we're checking for custom ads
    if (
      [STATION_TYPE.CUSTOM, STATION_TYPE.PLAYLIST_RADIO].includes(
        station.get('type'),
      )
    ) {
      station.set('checkAd', true);
    }
    // we're about to leave a replay track and go back to normal playback
    // set the new passed in playedFrom for following trackings
    if (currentTrackIsReplay) {
      if (!currentState.get('shouldTrackStreamStart')) {
        analytics.track(
          Events.StreamEnd,
          getPlayerAnalyticsData(
            this.getState(),
            store.getState(),
            'replay_complete',
          ),
        );
      }
      this.setPlayedFrom(PLAYED_FROM.PLAYER_RESUME_AFTER_REPLAY);
    }

    // start the buffering state in the player UI
    currentState.setPlayingState(PLAYER_STATE.LOADING);

    // Fetch more custom/OD tracks or different fallback stream type for live stations
    // Avoid if returning from replay on live playback since we want to keep the current protocol (hls)
    // we return here because _fetchTrackOrFallback recursively calls _next within it's async thread.
    if ((!playlist.length || !Number.isNaN(newTrackId)) && !liveReplayResume) {
      return this._fetchTrackOrFallback(
        station,
        profileId,
        sessionId,
        trackId,
        trackingInfo,
      );
    }

    // for custom stations playlist is an array of Media models
    // live stations first runs _next with a single hls stream model
    // when resuming replay we lost that playlist item, fetch from Station
    const track = liveReplayResume ? station.get('track') : playlist.shift();
    // ZS - 3/5/2018 - WEB-10954 since we now update Model immutably, we cannot rely on .shift() above
    // to create the cycling behavior. This MUST be fixed in a playback refactor
    if (!liveReplayResume) currentState.setPlaylist(playlist);

    const stream = track.get('stream') || {};
    const { type: streamType = '', url: streamUrl = '' } = stream;

    // This is a new station, trigger station start
    if (station.get('isNew')) {
      if (!currentState.get('shouldTrackStreamStart')) {
        currentState.set('replayCount', 0);
        currentState.set('shouldTrackStreamStart', true);
        analytics.track(
          Events.StreamEnd,
          getPlayerAnalyticsData(
            currentState.get('reference'),
            store.getState(),
            'new_station_start',
          ),
        );
      }
      this._newStation({ station, ...creds });

      station.set('isNew', false);
    }

    if (
      track.get('type') === 'track' &&
      stream &&
      stream.url &&
      stream.url.match('^http://stream.iheart.com')
    ) {
      station.set('reportStreamType', 'rtmp');
      stream.url = this._replaceTrackUrl(stream.url);
    }

    // We don't use setTrack here to bypass the check since
    // we deliberately called `next`
    this.changeTrack(track, station, currentTrackIsReplay);

    // Load the stream URL - If this is a live station and HLS is being used.
    if (['hls', 'm3u8'].includes(stream.type) && stationType === 'live') {
      // we removed rtmp timeout (old), now play hls directly
      station.set('reportStreamType', 'hls');

      // define hls and load it
      const urlToLoad = this._shortenTracking(trackingInfo, streamUrl, station);

      this._loadUrl(urlToLoad, stream.type);
    } else {
      // Load the stream URL - If this is not a live station.
      station.set('reportStreamType', streamType);
      const completeUrl = this._shortenTracking(
        trackingInfo,
        streamUrl,
        station,
      );
      this._loadUrl(completeUrl, streamType);
    }

    // If no stream type has been set yet, lets try to figure it out by the stream.url (unless steam.type exists) for live stations
    if (!station.get('reportStreamType')) {
      station.set(
        'reportStreamType',
        stationType === 'live' ?
          this._fallbackStreamDetection(streamUrl, streamType)
        : 'hls',
      );
    }

    store.dispatch(setPlayerInteracted(true));

    return Promise.resolve(track);
  }

  // we do warmup because browsers require that the play event be fired syncronously,
  // and we must fire async calls in order to make determinations about what stream to play. This just
  // buys us time to actually start playing the desired track. This appears to be tracked under the hood
  // by the browser, because once an audio or video tag is "warm" we no longer are restricted to sync playback
  //
  // PM - 6/1/18
  // we're not limiting this function for mobile, but to all browsers now. New autoplay rules dictate that in
  // order for audio to play, a user action must initiate it. unfortunately, we make an async call to get media,
  // and it isn't connected to the onClick to play a station. we use the warmup in non-mobile to have something
  // playing while waiting for the media asset to come in
  startWarmup(mediaId) {
    // get blankFile playing
    const fileSplit = this._player.config.blankFile.split('.');
    const fileType = fileSplit[fileSplit.length - 1];
    this._loadUrl(this._player.config.blankFile, fileType);
    store.dispatch(setIsWarmingUp(true));
    this.unmute({ isWarmingUp: true });

    // if we have a mediaId, set it in state so onComplete can start it playing
    if (mediaId) {
      const currentState = this.getState();
      currentState.setInitialTrack(mediaId);
    }
  }

  /**
   * Go Back one song
   * @return {Promise} a promise that resolves to the newly playing track
   */
  back() {
    const currentState = this.getState();
    const station = currentState.getStation();
    const creds = getCredentials(store.getState());
    const track = currentState.getTrack();
    const tracking = currentState.getTracking();

    // Report done for previous track if it exists
    // and if we haven't already reportedDone
    this.callReporting(
      reporting.reportDone,
      'done',
      {
        auth: { ...tracking, ...creds },
        data: reporting.trackDataPicker(track),
        position: this._player.getPosition(),
        shuffle: this.getState().getShuffleReportingState(),
      },
      track,
    ).then(() => track.set('reported', {}));
    // reset reporting since this is really a new play
    // (ad 12-01-16) Given we 'change track' below I suspect cleaning reported isn't needed

    return station.previous(creds, tracking.playedFrom).then(newTrack => {
      const { type, url } = newTrack.get('stream');
      this.changeTrack(newTrack, station);
      this._loadUrl(url, type);

      analytics.track(
        Events.Rewind,
        mapStationToAnalyticsData({
          station,
          currentTrack: track,
          profileId: currentState.get('creds').profileId,
        }),
      );

      return newTrack;
    });
  }

  restartSong() {
    const currentState = this.getState();
    const station = currentState.getStation();
    const track = currentState.getTrack();
    const creds = getCredentials(store.getState());
    const tracking = currentState.getTracking();

    this.callReporting(
      reporting.reportDone,
      'done',
      {
        auth: { ...tracking, ...creds },
        data: reporting.trackDataPicker(track),
        position: this._player.getPosition(),
        shuffle: this.getState().getShuffleReportingState(),
      },
      track,
    )
      .then(() => {
        // reset report state and check for shuffle changes
        track.set('reported', {});
        this.updateShuffleReportingState();

        this.callReporting(
          reporting.reportStart,
          'start',
          {
            auth: { ...tracking, ...creds },
            data: reporting.trackDataPicker(track),
            shuffle: this.getState().getShuffleReportingState(),
          },
          track,
        ).catch((/* err */) => {
          /* handle failure */
        });
      })
      .catch((/* err */) => {
        /* handle failure */
      });

    analytics.track(
      Events.Rewind,
      mapStationToAnalyticsData({
        station,
        currentTrack: track,
        profileId: currentState.get('creds').profileId,
      }),
    );

    return this.seek(0);
  }

  /**
   * Load a list of tracks to play
   * @param  {weblib.models.Media} playlist List of medias to play
   * @return {Array} Array of `weblib.models.Media` to be played
   */
  _playlist(playlist) {
    const oldPlaylist = this.getState().getPlaylist();

    // Getter? Return it
    if (playlist === undefined) {
      return oldPlaylist;
    }

    // Not an array? Make 1
    if (!Array.isArray(playlist)) {
      playlist = [playlist]; // eslint-disable-line no-param-reassign
    }

    // eslint-disable-next-line no-param-reassign
    playlist = playlist.filter(Boolean).map(m => {
      // Check if this is a backbone model. We have issue w/ using `instanceof Media` bc
      // browserify path resolving recognize lib/models path different from weblib.models path
      if (typeof m.get === 'function') {
        return m;
      }

      return new Media(m);
    });

    // Update state
    this.getState().setPlaylist(playlist);

    return playlist;
  }

  _togglePlay(setPlay) {
    const station = this.getState().getStation();
    const track = this.getState().getTrack() || station.get('track');

    this.tryingToPlay = setPlay;
    // If we're playing and there's no track

    if (setPlay && station && !track) {
      this._next();
    } else {
      const fn = setPlay ? 'play' : 'pause';

      if (this.getState().getConnectionLost()) {
        this._next().then(() => {
          this.getState().resetConnectionLost();
          this._player[fn]();
        });
      } else {
        this._player[fn]();
      }
    }

    return this;
  }

  /**
   * Handle time update
   * @param  {Object} durationObject Duration object w/ position & duration
   */
  _handleTime(durationObject = {}) {
    if (!durationObject.position || !durationObject.duration) {
      return;
    }
    const station = this.getState().getStation();
    const track =
      this.getState().getTrack() || (station && station.get('track'));

    if (!track) return;

    const { position } = durationObject;

    const tracking = this.getState().getTracking();
    const creds = getCredentials(store.getState());

    this.callReporting(
      reporting.report15,
      'scrobble',
      {
        auth: { ...tracking, ...creds },
        data: reporting.trackDataPicker(track),
        position,
        shuffle: this.getState().getShuffleReportingState(),
      },
      track,
      () => position >= 15,
    ).catch((/* err */) => {
      /* Silence uncaught errors */
    });

    if (this._state?.get('station')?.get('type') === STATION_TYPE.PODCAST) {
      this.updatePodcastTimeElapsed();
    }
  }

  _setController(name, controller) {
    this._controllers[name] = controller;
    return this;
  }

  _triggerError(err) {
    // IHRWEB-16696 favorites stream request failures were silent on UI
    store.dispatch(
      showPlayerErrorGrowl({ error: PlayerUIErrors.GenericInvalidMedia }),
    );
    hub.trigger(E.ERROR, err);
  }

  _handleHubEvents() {
    hub.on(E.TRACK_CHANGED, (track, station) => {
      if (!station) return;
      const trackType = track ? track.get('type') : null;
      const replayableStation = [
        STATION_TYPE.CUSTOM,
        STATION_TYPE.ARTIST,
        STATION_TYPE.TRACK,
        STATION_TYPE.LIVE,
        STATION_TYPE.PLAYLIST_RADIO,
      ].includes(station.get('type'));

      if (trackType !== 'preroll' && replayableStation && trackIsSong(track)) {
        replayStore.update(track, station);
      }
    });
  }

  _getNormalizedStationName() {
    const name = this.getState().getStation().get('name');
    return slugify(name).replace(/-/g, '_');
  }

  _getPlayerConfig() {
    return {
      config: {},
      events: {
        buffer: ({ reason }) => {
          if (this.getState().get('inInit')) {
            return;
          }

          const oldstate = this.getState().setPlayingState();
          if (oldstate === PLAYER_STATE.PLAYING && reason === 'stalled') {
            // WEB-11619 - AV - 21/6/2018
            // this means that not only do we not have network, but we have exhausted the buffer and playback has stopped
            // to prevent the handling of this from getting to complicated we just force player state to mirror what the player
            // is actually doing and let the user restart the stream once they think the problem has been solved.
            this.stop();
            // WEB-11619 - AV - 21/6/2018
            // and of course we have to tell the user that it's their problem now.
            store.dispatch(showPlaybackNetworkErrorGrowl());
          } else {
            hub.trigger(E.BUFFER);
          }
        },

        time: durationObject => {
          const station = this.getState().getStation();
          const track =
            this.getState().getTrack() || (station && station.get('track'));
          const { duration } = durationObject;
          if (!track) return;

          if (duration === 0) return;
          this._handleTime(durationObject);
          hub.trigger(E.TIME, durationObject);
        },

        idle: stateObject => {
          if (
            this.getState().getStation() !== 'live' &&
            stateObject.oldstate !== PLAYER_STATE.PLAYING
          ) {
            this._playerPosition = this._player.getPosition(); // used for pause timeout
          }
          this.getState().setPlayingState(PLAYER_STATE.IDLE);
          hub.trigger(E.IDLE);
        },

        pause: pauseEvent => {
          this.getState().setPlayingState('PAUSED');
          hub.trigger(E.PAUSE);
          this._playerPaused = true; // TODO: this needs to be merged with this.tryingToPlay

          const playlistItem = this._player?.instance?.getPlaylistItem(
            this._player.instance.getPlaylistIndex(),
          );

          if (
            playlistItem?.type === 'hls' &&
            pauseEvent.pauseReason === undefined
          ) {
            this._player?.instance?.detachMedia();
            this._detached = true;
          }
        },

        play: () => {
          const currentState = this.getState();
          const station = currentState.get('station');
          const track = currentState.get('track');
          const state = store.getState();
          const isWarmingUp = getIsWarmingUp(state);
          const isBlankFile =
            getCurrentlyLoadedUrl(state) === this._player.config.blankFile;
          if (isWarmingUp && !isBlankFile)
            store.dispatch(setIsWarmingUp(false));

          if (station && !station.partialLoad) {
            const subType = getSubscriptionType(state);
            const podcastEpisodeData = track?.attrs?.content;

            // AA 11/11/20 - IHRWEB-15872 - Avoid weird tracking behavior by removing stream start when streaming the warmup blank file
            if (currentState.get('shouldTrackStreamStart') && !isBlankFile) {
              if (currentState.getPlayingState() !== PLAYER_STATE.LOADING) {
                trackers.track(Events.StreamStart, {
                  podcastEpisodeData,
                  profile: getProfile(state),
                  session: getSession(state),
                  station,
                  subType,
                });

                trackers.track(Events.ViewContent);

                analytics.track(
                  Events.StreamStart,
                  getPlayerAnalyticsData(this.getState(), state),
                );
              }
              currentState.set('reference', cloneDeep(this.getState()));
            }

            const creds = getCredentials(store.getState());
            const tracking = currentState.getTracking();
            const stationIsLive = station.get('stationType') === 'LIVE';

            if (
              currentState.get('position') &&
              station.get('stationType') !== 'PODCAST' &&
              currentState.isIdle()
            ) {
              this.seek(currentState.get('position'));
              // Is this needed? Didn't see any issues commenting this out and it didn't seem
              // to have any relevant implimentation.
              // this._playerPosition = null;
            }

            this._playerPaused = false;

            currentState.setPlayingState(PLAYER_STATE.PLAYING);

            currentState.set('isSkipping', false);

            // Trigger stationFirstPlay for station that hasn't played music before
            if (!station.get('played') && !getIsWarmingUp(store.getState())) {
              hub.trigger(E.STATION_FIRST_PLAY, station);
              station.set('played', true);
            }

            const trackIsReplay = !!track && track.get('isReplay');

            // live station reporting is done when we receive metadata.
            if (!stationIsLive || trackIsReplay) {
              this.callReporting(
                reporting.reportStart,
                'start',
                {
                  auth: { ...tracking, ...creds },
                  data: reporting.trackDataPicker(track),
                  shuffle: this.getState().getShuffleReportingState(),
                },
                track,
              ).catch((/* err */) => {
                /* handle failure */
              });
            }

            hub.trigger(E.PLAY);
          }
        },

        error: err => {
          const state = this.getState();
          const controller = state.getController();
          const station = state.getStation();

          if (station.get('seedType') === STATION_TYPE.LIVE) {
            state.set('usedFallback', true);

            analytics.track(
              Events.StreamFallback,
              mapLiveStationAnalytics({
                station,
                fallbackErrorCode: -1,
                fallbackErrorDescription: err.message,
              }),
            );
          }

          // There's an error with the file JW player is attempting to play
          // Dispatch a UI error to display & stop playback.
          const type = err?.sourceError?.type ?? err?.type;
          const { code } = err;
          // There's a network error. Show error & stop playback
          if (
            [
              JW_ERRORS.NETWORK_HTTP_ERROR,
              JW_ERRORS.NETWORK_OFFLINE_ERROR,
            ].includes(code) ||
            // sometimes network errors are reported as media errors, this ensures that we show
            // the right error message when this occurs if the device is not online
            !window.navigator.onLine
          ) {
            // WEB-11619 - AV - 21/6/2018
            // this generally means that there's a network error and the controller isn't going to
            // be able to recover by trying a different stream/track
            this.stop();
            // WEB-11619 - AV - 21/6/2018
            // we clear the track so that we don't hold onto the playlist
            // if you don't do this there'll be a cascade of errors in _next
            // if we don't want to do this then we'll need to prevent the stop response to "stalled"
            // in the buffer callback
            this.getState().setConnectionLost();
            return store.dispatch(showPlaybackNetworkErrorGrowl());
          }

          if (
            [JW_ERRORS.INVALID_MEDIA, JW_ERRORS.ACCESS_DENIED].includes(code)
          ) {
            // Dispatch UI error
            let growlError = PlayerUIErrors.GenericInvalidMedia;
            if (station.get('seedType') === STATION_TYPE.PODCAST) {
              growlError = PlayerUIErrors.PodcastInvalidMedia;
            }
            store.dispatch(showPlayerErrorGrowl({ error: growlError }));

            // fire analytics event
            const { profileid: profileId, playedFrom } = state.getTracking();
            const analyticsData = mapStationToAnalyticsData({
              station,
              currentTrack: state.getTrack(),
              profileId,
            });

            let errorMessage = `${getGrowlMessage(
              growlError,
            )} JW Error: ${code}.`;
            if (type) errorMessage += ` Type: ${type}.`;

            analyticsData.station = {
              ...analyticsData.station,
              errorMessage,
              errorType: PlayerErrorType.PlaybackFailure,
              playedFrom,
            };
            analytics.track(Events.PlaybackError, analyticsData);

            // stop playback
            this.handleInvalidMedia();
            return hub.trigger(E.ERROR, err);
          }

          if (
            controller &&
            // WEB-13038 - AV - 5/7/2019
            // It's possible for errors from blank.mp4 to get here and for isWarmingUp to be false,
            // unlike errors from the real track which is getting loaded up while blank.mp4 plays, we
            // don't want these errors to fallback to the next track, since we haven't tried playing
            // the current track yet.
            getCurrentlyLoadedUrl(store.getState()) !==
              this._player.config.blankFile
          ) {
            return controller.handleError(station, err).then(this._next, e => {
              store.dispatch(
                openModal({
                  id: ConnectedModals.MobileDirect,
                }),
              );

              return hub.trigger(E.ERROR, e);
            });
          }
          return hub.trigger(E.ERROR, err);
        },

        beforeComplete: () => {
          // NOTE: it is recommended by the JW team to use 'onBeforeComplete' event to make custom ads call.
          const currentState = this.getState();
          const station = currentState.getStation();

          if (currentState.get('inInit') || station.partialLoad) {
            return;
          }
          const replayQueued = !!currentState.getReplayState();
          const track = currentState.getTrack();
          const tracking = currentState.getTracking();
          const creds = getCredentials(store.getState());

          // now that we have the potential to play custom stream ads, we need to make sure we
          // report complete BEFORE we attempt to play ads. Code is pulled from onComplete event
          // if we're skipping the report call is already fired
          if (!currentState.get('isSkipping')) {
            const reportFunction =
              replayQueued ? reporting.reportReplay : reporting.reportDone;

            this.callReporting(
              reportFunction,
              'done',
              {
                auth: { ...tracking, ...creds },
                data: reporting.trackDataPicker(track),
                position: this._player.getPosition(),
                shuffle: currentState.getShuffleReportingState(),
              },
              track,
            );
          }

          // IHRWEB-15411 Web-Ads 2.0 implementation (MP)
          if (CUSTOM_TYPES.includes(station.get('type'))) {
            if (!currentState.get('isSkipping')) {
              customInstreamEmitter.play();
            }
          }
        },

        complete: () => {
          const currentState = this.getState();
          const station = currentState.getStation();
          const reduxState = store.getState();

          // If the paused timeout exists, we are paused and timed out, otherwise the song is over
          if (this._playerPaused) {
            this._playerPaused = false;
            return;
          }

          // 9/14/2017 ZS we're completing the pre-start
          if (
            currentState.get('inInit') ||
            getCurrentlyLoadedUrl(reduxState) === this._player.config.blankFile
          ) {
            return;
          }

          hub.trigger(E.COMPLETE);

          // If we're skipping, no need to call _next()
          if (!currentState.get('isSkipping')) {
            // when playing a custom Ad, aparently there is some internal JW 'teardown' logic
            // that prevents load & play, so we force this call to happen in next 'loop'
            const currentTrack = currentState.getTrack();
            const trackToPlay =
              (
                ['episode', 'track'].includes(
                  currentTrack && currentTrack.get('type'),
                )
              ) ?
                undefined
              : currentState.getInitialTrack();
            const adsFreeEntitlement = adsFreeCustomSelector(reduxState);
            const customAdsFeatureFlag = getCustomAdsEnabled(reduxState);
            const hasAds =
              !adsFreeEntitlement && !isAdBlocked() && customAdsFeatureFlag;

            if (CUSTOM_TYPES.includes(station.get('type')) && hasAds) {
              const unsubscribe = customInstreamEmitter.subscribe({
                complete: () => {
                  unsubscribe();
                  setTimeout(() => this._next(trackToPlay), 0);
                },
              });
            } else {
              setTimeout(() => this._next(trackToPlay), 0);
            }
            currentState.resetInitialTrack();
          }

          currentState.set('isSkipping', false);
        },

        meta: data => {
          logger.info(
            [CONTEXTS.PLAYBACK, CONTEXTS.LIVE, 'meta'],
            data.metadata,
          );
          const currentState = this.getState();
          const controller = currentState.getController();
          const station = currentState.getStation();
          if (!station || station.get('seedType') !== STATION_TYPE.LIVE) {
            return Promise.resolve();
          }
          const track = currentState.getTrack();
          const tracking = currentState.getTracking();
          const creds = getCredentials(store.getState());
          const { listenerId } = currentState.getGlobalTracking();
          const reduxState = store.getState();
          if (
            station &&
            getPivotGeoEnabled(reduxState) &&
            getIsOwnedAndOperated(reduxState, { stationId: station.id }) &&
            data.metadata
          ) {
            store.dispatch(
              receiveLiveMetaData(
                station.get('id'),
                _get(tracking, 'playedFrom'),
                listenerId,
                data.metadata,
              ),
            );
          }

          // Echo out the raw data
          currentState.setMetaData(data.metadata);
          const promise =
            controller &&
            controller.handleMetadata(station, track && track.id, data);
          return (
            promise &&
            promise.then(media => {
              // We got a track, might not be full (no ID)
              if (media && typeof media.get === 'function') {
                this.callReporting(
                  reporting.reportStart,
                  'start',
                  {
                    auth: { ...tracking, ...creds },
                    data: reporting.trackDataPicker(media),
                    shuffle: false,
                  },
                  media,
                ).catch((/* err */) => {
                  /* silence error */
                });

                /**
                 * By default, any live station that is loaded into the player
                 * uses the worker by default when polling for metadata. When
                 * the station begins playing and we are able to parse metadata
                 * out of the stream, then we turn the worker off and fall back
                 * to jw's default metadata handling.
                 * Developer: Mark Holmes
                 * Date: 04/06/2018
                 * Reference: https://jira.ihrint.com/browse/WEB-10902
                 */
                const idNumber = Number(media.id);
                const idIsNumberLike = !Number.isNaN(idNumber);
                if (
                  (idIsNumberLike && idNumber > -1) ||
                  (!idIsNumberLike && media.id)
                ) {
                  gracenote.unsubscribe();
                } else {
                  return;
                }

                currentState.setTrack(media);
              }

              hub.trigger(E.TRACK_CHANGED, media, station);
            })
          );
        },

        mute: e => {
          this.getState().setMute(e.mute);
          hub.trigger(E.MUTE, e.mute);
        },

        volume: e => {
          this.getState().setVolume(e.volume);
        },

        beforePlay: () => {
          if (this._detached) {
            this._player?.instance?.attachMedia();
            this._detached = false;
          }

          // set metadata for responsive playback in ios so the lock screen/now playing dialog
          // show correct metadata
          const currentState = this.getState();
          const station = currentState.getStation();
          const track = currentState.getTrack();
          const element = document.querySelector('#jw-player video.jw-video');
          const isSeeking = currentState.get('isSeeking');

          // WEB-8461 check for presence of element due to issues related to ie11
          // since there are no mobile devices running ie11, we just ignore
          if (element && track) {
            const title = metadataString(station, track);
            element.setAttribute('title', title);
          }

          this.updateShuffleReportingState();

          // order of operation is important, we set the seek position prior to calling an ad
          if (
            station &&
            station.get('type') === STATION_TYPE.PODCAST &&
            track &&
            !isSeeking
          ) {
            // Resume from last played point if podcast
            const podcastId = station.id;
            const sharePosition = station.get('position');
            const episodeId = track.get('id');
            const secondsPlayed = getCurrentlyPlayingEpisodePosition(
              store.getState(),
              {
                id: episodeId,
              },
            );
            const duration = getCurrentlyPlayingEpisodeDuration(
              store.getState(),
              {
                id: episodeId,
              },
            );
            const bufferTime = 30;
            if (duration - secondsPlayed > bufferTime || sharePosition) {
              if (sharePosition) {
                this.seek(Math.floor(sharePosition));
              } else {
                // if episode is NOT fully played, play from the episode's `secondsPlayed`
                this.seek(secondsPlayed);
              }
            } else if (secondsPlayed) {
              // if episode IS fully played set the episode's `secondsPlayed` back to 0
              store.dispatch(
                updatePodcastPlayProgress(0, podcastId, episodeId),
              );
            }
          }
        },

        playAttemptFailed: ({ error, type }) => {
          const currentState = this.getState();
          store.dispatch(setIsWarmingUp(false));
          currentState.setPlayingState(PLAYER_STATE.IDLE);
          hub.trigger(E.IDLE);
          logger.error([CONTEXTS.JW_PLAYER, type], {}, {}, error);
        },

        ready: (...args) => {
          const currentState = this.getState();
          currentState.set('shouldTrackStreamStart', true);
          currentState.set('replayCount', 0);
          currentState.set('usedFallback', false);
          const element = document.querySelector('#jw-player video.jw-video');

          element.setAttribute('title', 'You are listening to iHeart');
          hub.trigger(E.READY, args);
        },

        seeked: () => {
          const currentState = this.getState();
          currentState.set('isSeeking', false);
        },
        // WEB-11619 - AV - 6/21/18
        // this callback is INCREDIBLY USEFUL for figuring out which callbacks jw fires and when
        // not all of them are in the docs, so this may sometimes be the only practical way
        // to debug certain issues.
        // (ev contains an identical object to the one that will be passed to the callback with the <type> name)
        // JW warns that callbacks to this event will seriously harm performance, so in general we should
        // not use it.
        ...(__DEV__ ?
          {
            all: (type, ev) => {
              if (type.toLowerCase().includes('error')) {
                logger.error([CONTEXTS.JW_PLAYER, type], {}, {}, new Error(ev));
              }
            },
          }
        : {}),
      },
    };
  }

  // IHRWEB-15665 handles error for invalid media.
  // TLDR: Resets track state, stops playback.
  handleInvalidMedia() {
    const state = this.getState();
    const station = state.get('station');

    state.setPlaylist([]);
    this.stop();
    this.changeTrack(null, station);
    this._playerPosition = null;
  }

  // all functions below this point are specifically for _next
  // they are created to make the function easier to reason about

  _newStation({ station, profileId, sessionId }) {
    if (profileId && sessionId && station.registerListen) {
      station.registerListen(profileId, sessionId);
    }
  }

  _fallbackStreamDetection(streamUrl, streamType) {
    if (streamUrl.indexOf('rtmp:') !== -1) {
      return 'rtmp';
    }

    if (streamUrl.indexOf('.flv') !== -1) {
      return 'flv';
    }

    if (
      streamUrl.indexOf('.aac') !== -1 ||
      streamUrl.indexOf('chunks.ihrls.com') !== -1 ||
      streamUrl.indexOf('playlists.ihrls.com') !== -1
    ) {
      return 'rtmp';
    }

    return streamType || 'n/a';
  }

  _replaceTrackUrl(url) {
    return url.replace(
      'http://stream.iheart.com',
      'rtmp://thumbplay123fs.fplive.net/thumbplay123/mp4:',
    );
  }

  _shortenTracking(trackingInfo, url, station) {
    // if we're podcast, art19 can't do longer than 2150, otherwise 4095 is our limit for flash live streams
    const maxLength = 2150;

    const fullUrl = processStreamUrl(url, trackingInfo, station);
    const parsedfullUrl = UrlParse(fullUrl, {});
    const urlParams = new URLSearchParams(parsedfullUrl.query);

    // art19 podcasts seem to reject anything more than
    // 2150 characters
    if (fullUrl.length > maxLength) {
      let shortendUrl = fullUrl;
      let shortendTrackingInfo = trackingInfo;
      if (trackingInfo.ccaud?.length || urlParams.get('aw_0_1st.ccaud')) {
        // Trim off CCAUD values until we have a small enough length
        const ccaud =
          trackingInfo.ccaud?.slice() ??
          urlParams.get('aw_0_1st.ccaud').split(',');
        let currentLength = fullUrl.length;
        for (
          let i = ccaud.length - 1;
          i >= 0 && currentLength > maxLength;
          i -= 1
        ) {
          currentLength -= ccaud[i].length + 3; // three chars for %2C (ampersand)
          ccaud.splice(i, 1);
        }
        shortendTrackingInfo = { ...trackingInfo, ccaud };
        shortendUrl = processStreamUrl(url, shortendTrackingInfo, station);
      } else {
        shortendTrackingInfo = omit(trackingInfo, 'ccaud');
        // Hopefully dropping the ccaud prop is enough. Good luck, everybody.
        shortendUrl = processStreamUrl(url, shortendTrackingInfo, station);
      }

      // cutting off ccauds was not enough, we need to cut more stuff
      if (
        shortendUrl.length > maxLength &&
        station.get('ads').enable_triton_token
      ) {
        // get the queryString
        const [bareUrl, qs] = shortendUrl.split('?');
        // sort params by length descending and filter out non-optional-params
        const paramStrings = qs.split('&').sort((a, b) => b.length - a.length);

        // cut out params starting from the longest until we have removed enough chars
        const reduced = paramStrings.reduce(
          ({ params, charsToCut }, param) => {
            const [key] = param.split('=');
            if (charsToCut <= 0 || MANDATORY_TRITON_PARAMS.includes(key)) {
              // enough params have been cut or this param can't be cut, add current param to the list
              return {
                params: [...params, param],
                charsToCut,
              };
            } else {
              // omit param from list, subtract it's length from the number of chars left to cut
              return {
                params,
                charsToCut: charsToCut - param.length,
              };
            }
          },
          { params: [], charsToCut: shortendUrl.length - maxLength },
        );

        shortendUrl = [bareUrl, '?', reduced.params.join('&')].join('');
      }
      return shortendUrl;
    }

    return fullUrl;
  }

  handleAgeLimit(stationType, ageLimit) {
    if ([STATION_TYPE.PLAYLIST_RADIO].includes(stationType)) {
      store.dispatch(setTFCDAge(ageLimit));
    }
  }

  // this loads up new tracks when the playlist is empty and recursively calls _next
  _fetchTrack(station, profileId, sessionId, trackId, trackingInfo) {
    const reportableTrackingInfo = getPIICompliantTrackingParams(trackingInfo);
    return station
      .next(profileId, sessionId, trackId, reportableTrackingInfo.playedFrom)
      .then(({ tracks, ageLimit }) => {
        this.handleAgeLimit(station.get('type'), ageLimit);
        return this._playlist(tracks);
      })
      .then(this._next)
      .then(undefined, this._triggerError)
      .catch(error => {
        logger.error(CONTEXTS.PLAYER, 'error fetching track!', {}, {}, error);
      });
  }

  _fetchTrackOrFallback(station, ...otherArgs) {
    if (station.wasRemoved && station.wasRemoved()) {
      hub.trigger(E.PLAYER_RESET_STATION);
      // if we're falling back force JW to stop playing
      this._player.stop();
      return Promise.resolve();
    }

    return this._fetchTrack(station, ...otherArgs);
  }

  _handleReplay() {
    const currentState = this.getState();
    const station = currentState.getStation();
    const track = currentState.getTrack();
    const creds = getCredentials(store.getState());
    const replayTrack = currentState.getReplayState();
    const replayStation = replayTrack.get('replayStation');
    const stream = replayTrack.get('stream');
    const { type: streamType, url: streamUrl } = stream;

    currentState.set('replayCount', currentState.get('replayCount') + 1);

    // update the player tracking state
    // use the replay playedFrom from now on
    this.setPlayedFrom(PLAYED_FROM.PLAYER_REPLAY);
    const newTrackingInfo = currentState.getTracking();
    const completeUrl = processStreamUrl(
      streamUrl,
      newTrackingInfo,
      replayStation,
    );

    // Current playing track reporting as 'done' due to replay starting
    this.callReporting(
      reporting.reportReplay,
      'done',
      {
        auth: { ...newTrackingInfo, ...creds },
        data: reporting.trackDataPicker(track),
        position: this._player.getPosition(),
        shuffle: this.getState().getShuffleReportingState(),
      },
      track,
    );

    analytics.track(
      Events.Replay,
      mapStationToAnalyticsData({
        station,
        currentTrack: replayTrack,
        profileId: currentState.get('creds').profileId,
      }),
    );

    // update the currentTrack state with the new replay track (including isReplay: true)
    // don't use this.changeTrack because we don't want to update the active station
    currentState.setTrack(replayTrack);

    // update jwplayer stream url
    this._loadUrl(completeUrl, streamType);

    // register a new track change event
    hub.trigger(E.TRACK_CHANGED, replayTrack, replayStation);

    // cleanup replay state so next "_next" call plays the next track
    currentState.resetReplayState();
  }

  changeTrack(track, station, currentTrackIsReplay = false) {
    const currentState = this.getState();
    station.set('track', track);
    currentState.setTrack(track);
    hub.trigger(E.TRACK_CHANGED, track, station, currentTrackIsReplay);
  }

  /**
   * check if the current user is the active streamer to respect device limiting for OD playback
   * which is brought in by reporting calls
   * for further information please see https://wiki.ihrint.com/display/PM/OD+Playback
   * @param  {object} response return from an ajax reporting call
   * @return {object}          return the response unaltered for further processing
   */
  checkActiveStreamer(data) {
    if (!data) return;
    const { isActiveStreamer } = data;
    const currentState = this.getState();
    const station = currentState.getStation();
    const track = currentState.getTrack();
    const seedType = station.get('seedType');
    const stationType = station.get('type');

    // check isReplay to make sure we catch live radio replay
    const isReplay = track ? track.get('isReplay') : false;
    if (
      !isActiveStreamer &&
      seedType !== STATION_TYPE.FAVORITES && // we special case out favorites until we move to the new reporting endpoints
      ([
        ...COLLECTION_TYPES,
        STATION_TYPE.MY_MUSIC,
        STATION_TYPE.ALBUM,
        STATION_TYPE.CUSTOM,
      ].includes(stationType) ||
        isReplay)
    ) {
      hub.trigger(E.NOT_ACTIVE_STREAMER);
    }

    return data; // eslint-disable-line consistent-return
  }

  callReporting(
    fn,
    key,
    data,
    track = this.getState().getTrack(),
    conditionalFn = () => true,
  ) {
    const station = this.getState().getStation();
    const stationType = station && station.get('type');
    const reportableData = {
      ...data,
      auth: stationType ? getPIICompliantTrackingParams(data.auth) : data.auth,
    };

    return reporting
      .reportingPermitted(reportableData, track, key, conditionalFn)
      .then(fn)
      .then(({ data: reportingResponse }) => {
        const { hourSkipsRemaining, daySkipsRemaining } = reportingResponse;
        if (
          hourSkipsRemaining !== undefined &&
          daySkipsRemaining !== undefined
        ) {
          store.dispatch(setSkips(hourSkipsRemaining, daySkipsRemaining));
        }
        return reportingResponse;
      })
      .then(
        stationType && stationType !== STATION_TYPE.PODCAST ?
          this.checkActiveStreamer
        : () => {},
      )
      .then(() => setReported(track, key))
      .catch((/* err */) => {});
  }

  updateShuffleReportingState(station = this.getState().getStation()) {
    this.getState().setShuffleReportingState(
      _get(station, ['attrs', 'playlist', 'shuffleState'], false),
    );
  }
}

export default IHRPlayer;
