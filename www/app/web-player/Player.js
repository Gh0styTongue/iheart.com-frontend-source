import * as UPSELL_FROM from 'modules/Analytics/constants/upsellFrom';
import hub, { E } from 'shared/utils/Hub';
import logger, { CONTEXTS } from 'modules/Logger';
import Media from 'web-player/models/Media';
import PLAYED_FROM from 'modules/Analytics/constants/playedFrom';
import PlayerClass from './Main';
import PlayerState from './PlayerState';
import PlaylistTypes from 'constants/playlistTypes';
import reduxFactory from 'state/factory';
import rejectPromiseOnTimeout from 'utils/rejectPromiseOnTimeout';
import resolveStation from 'state/Player/resolvers';
import Station from 'web-player/models/Station';
import transport from 'api/transport';
import UPSELL from 'constants/upsellTracking';
import watch from 'redux-watch';
import whenPopulated from 'utils/whenPopulated';
import {
  AlertContexts,
  ConfirmContexts,
  ConnectedModals,
} from 'state/UI/constants';
import {
  artistToStartSelector,
  moreSkipsSelector,
  playAlbumSelector,
  showAlbumUpsellSelector,
  songToStartSelector,
  subInfoLoadedSelector,
} from 'state/Entitlements/selectors';
import {
  canPlayOD as canPlayPlaylistOD,
  canPlayRadio as canPlayPlaylistRadio,
  getCurrentOwnerId,
  getCurrentSeedId,
  getCurrentStationType,
  getCurrentType,
  getStationType as getPlaylistStationType,
} from 'state/Playlist/selectors';
import { cloneDeep, get, memoize, merge, throttle } from 'lodash-es';
import { createStructuredSelector } from 'reselect';
import {
  CUSTOM_TYPES,
  ON_DEMAND_TYPES,
  STATION_TYPE,
} from 'constants/stationTypes';
import { fetchInitialRecs } from 'state/Recs/actions';
import { getAds } from 'state/Live/selectors';
import {
  getAge,
  getBirthYear,
  getGender,
  getPreferences,
} from 'state/Profile/selectors';
import {
  getAmpUrl,
  getCountryCode,
  getHost,
  getStationSoftgate,
  getSupportedCountries,
  getTerminalId,
} from 'state/Config/selectors';
import { getArtistId } from 'state/News/selectors';
import { getInstance as getAuthLoadInstance } from 'web-player/AuthLoad';
import {
  getCredentials,
  getDeviceId,
  getIsAnonymous,
  getIsAuthenticated,
  getIsLoggedOut,
  getProfileId,
  getSessionId,
} from 'state/Session/selectors';
import { getCurrentArtistId } from 'state/Artists/selectors';
import {
  getCurrentEpisodeId,
  getIsSubDirectory,
  getResourceId,
  getRouteNamespace,
  getRouteParams,
} from 'state/Routing/selectors';
import { getCurrentGenreSparkStreamId } from 'state/Genres/selectors';
import { getCurrentPodcastEpisodes } from 'state/Podcast/selectors';
import {
  getCustomRadioEnabled,
  getLiveRadioEnabled,
} from 'state/Features/selectors';
import { getEpisodes } from 'state/Podcast/services';
import { getRootSeedId as getFavoritesSeedId } from 'state/Favorites/selectors';
import { getForYouRecs } from 'state/Recs/selectors';
import { getIsInApp, getIsMobile } from 'state/Environment/selectors';
import { getIsWarmingUp } from 'state/Player/selectors';
import {
  getListenHistory,
  getListenHistoryReceived,
} from 'state/Stations/selectors';
import { getInstance as getPageStoreInstance } from 'client/js/services/PageStore';
import { getSearch } from 'state/SearchNew/selectors';
import { getStationModel } from './shims';
import { getStationType } from 'web-player/utils/getStationType';
import { getTranslateFunction } from 'state/i18n/helpers';
import { getTritonPartnerIds } from 'state/Ads/selectors';
import { getTritonSecureToken } from 'state/Ads/actions';
import { isPlaylist } from 'state/Playlist/helpers';
import { liveStations } from 'state/Live/services';
import {
  openModal,
  openSignupModal,
  openUpsellModal,
  showNotifyGrowl,
} from 'state/UI/actions';
import { pathIsChildOrParent } from 'state/SearchNew/helpers';
import { PLAYER_STATE } from 'constants/playback';
import { postStreams, setActiveStreamer } from 'state/Player/services';
import { query as queryUtil } from 'utils/url';
import { setIsWarmingUp } from 'state/Player/actions';
import { setListenHistory } from 'state/Favorites/actions';
import {
  setPodcastEpisodes,
  setPodcastProfile,
  updatePodcastPlayProgress,
} from 'state/Podcast/actions';
import { setStation } from 'state/Playback/actions';
import { toModel } from 'utils/immutable';

const profileSelector = createStructuredSelector({
  age: getAge,
  birthYear: getBirthYear,
  deviceId: getDeviceId,
  gender: getGender,
  isAnonymous: getIsAnonymous,
  isAuthenticated: getIsAuthenticated,
  isLoggedOut: getIsLoggedOut,
  listenHistoryReceived: getListenHistoryReceived,
  preferences: getPreferences,
  profileId: getProfileId,
  sessionId: getSessionId,
  subInfoLoaded: subInfoLoadedSelector,
});

const createRadioSelector = createStructuredSelector({
  isAnonymous: getIsAnonymous,
  isAuthenticated: getIsAuthenticated,
  isInApp: getIsInApp,
  isLoggedOut: getIsLoggedOut,
  profileId: getProfileId,
  sessionId: getSessionId,
});

const authLoad = getAuthLoadInstance();
const pageStore = getPageStoreInstance();
const playerState = PlayerState.getInstance();
const query = queryUtil();
const store = reduxFactory();
const profileWatcher = watch(() => profileSelector(store.getState()));

const supportedCountries = getSupportedCountries(store.getState());

/**
 * Driver for web-player
 * @constructor
 */

function Player(opts = {}) {
  let shownModal = false;
  let idWhenBlurred;
  let timeLeftWhenBlurred;
  let wasPlayingWhenBlurred;
  let timeBlurred;

  /* ZS - WEB-11055
   * this allows us to fire off state management stuf around blurring on mobile in particular because
   * mobile doesn't really allow us to execute code, e.g. to play the next song when the tab is
   * backgrounded
   */
  window.addEventListener('blur', () => {
    const station = playerState.get('station');
    if (station && station.get('seedType') !== 'live') {
      const track = playerState.get('track');
      timeBlurred = Date.now();
      idWhenBlurred = track ? track.id : undefined;
      timeLeftWhenBlurred =
        track ?
          (playerState.getDuration() - playerState.getPosition()) * 1000
        : Infinity;
      wasPlayingWhenBlurred = playerState.getPlayingState() === 'PLAYING';
    }
  });

  window.addEventListener('focus', () => {
    const track = playerState.get('track');
    if (
      !track ||
      !getIsMobile(store.getState()) ||
      this._player !== this._webPlayer
    )
      return;

    const songHasntChanged =
      idWhenBlurred !== undefined && idWhenBlurred === track.id;
    const songShouldHaveEnded =
      Date.now() - timeBlurred > timeLeftWhenBlurred + 250;

    if (
      wasPlayingWhenBlurred &&
      songHasntChanged &&
      songShouldHaveEnded &&
      !shownModal
    ) {
      const station = playerState.getStation();
      if (!station) {
        return;
      }

      if (!shownModal) {
        store.dispatch(
          openModal({
            id: ConnectedModals.Confirm,
            context: ConfirmContexts.ListenInApp,
          }),
        );

        shownModal = true;
      }
    }
  });

  this._chromecast = opts.chromecast;
  this._chromecast.setState(PlayerState.getDummyState());

  this._state = playerState;
  this.articleArtist = opts.articleArtist;

  // We need to bind these 1st because they don't rely on player
  // and also these might be triggered before it's ready

  hub
    .on(E.Chromecast.CONNECTED, this._onChromecastConnected, this)
    .on(E.Chromecast.DISCONNECTED, this._onChromecastDisconnected, this)
    .on(E.Chromecast.VOLUME, this._onChromecastVolumeChange, this)
    .on(E.Chromecast.MUTE, this._onChromecastMutedChange, this)
    .on(E.CREATE_RADIO, this._throttledCreateRadio, this)
    .on(E.PLAYER_PLAY_TOGGLED, this._onPlayToggle, this)
    .on(
      E.PLAY_BUT_NOT_REALLY,
      (stationType, stationId, playedFrom, options) => {
        if (playerState.isPaused() || playerState.isIdle()) {
          if (isPlaylist(stationType)) {
            this._throttledCreateRadio(
              getPlaylistStationType(store.getState(), { seedId: stationId }),
              stationId,
              playedFrom,
              options,
            );
          } else {
            this._throttledCreateRadio(
              stationType,
              stationId,
              playedFrom,
              options,
            );
          }
        }
      },
    )
    .on(E.SEEK_RELATIVE, this._seekRelative, this)
    .on(E.BECOME_ACTIVE_LISTENER, this.becomeActive, this)
    .on(E.UPDATE_SPEED, this.updateSpeed, this);

  this._initializeTracking();
  store.subscribe(profileWatcher(this.profileChanged.bind(this)));
}

Player.prototype.intitializeWebPlayer = memoize(
  function intitializeWebPlayer() {
    return new Promise(resolve => {
      hub.once(E.READY, resolve);

      // Only works on visible element (no display:none or visibility:hidden)
      this._webPlayer = new PlayerClass();

      this._player = this._webPlayer;

      this._webPlayer.hasSkipPrivilege = function hasSkipPrivilege() {
        return moreSkipsSelector(store.getState());
      };
    }).then(() => {
      this.webPlayerInitialized = true;
      this._triggerVolumeAndMuteChange();
      this._initializeListeners();
    });
  },
);

Player.prototype.isReady = function isReady() {
  return this.intitializeWebPlayer()
    .then(() => this.initialStationLoadedPromise)
    .catch(e => logger.error([CONTEXTS.PLAYBACK, 'Player.isReady'], {}, {}, e));
};

Player.prototype._triggerVolumeAndMuteChange =
  function _triggerVolumeAndMuteChange() {
    const prevState = playerState.getStoredState();
    // Trigger volume & mute change
    if (typeof prevState.volume !== 'number') {
      prevState.volume = 60;
    }
    this._player.volume(prevState.volume);

    if (prevState.mute) {
      this._player.mute();
    } else {
      this._player.unmute();
    }
  };

Player.prototype._initializeListeners = function _initializeListeners() {
  hub.on(
    // IHRWEB-15411 putting under flag to highlight for Web-Ads 2.0 implementation (MP)
    E.TIME,
    this._onTime,
    this,
  );

  // when a track finishes, set the position to zero for the next track
  hub.on(
    // IHRWEB-15411 putting under flag to highlight for Web-Ads 2.0 implementation (MP)
    [E.COMPLETE],
    this._resetPosition,
    this,
  );

  // TODO: figure out why incorrect time event is being called after track change (WEB-4136).
  // This is a hacky patch to ignore if new song starts at pos>0
  hub.on(
    E.TRACK_CHANGED,
    function trackChanged() {
      this._resetPosition();

      hub.off(
        // IHRWEB-15411 putting under flag to highlight for Web-Ads 2.0 implementation (MP)
        E.TIME,
        this._onTime,
        this,
      );
      hub.once(E.TIME, this._ensureTrackStartsFromZero, this);
    },
    this,
  );

  // Just print error out for now
  hub.on(E.ERROR, this._handleError, this);

  // if you aren't the active streamer
  hub.on(E.NOT_ACTIVE_STREAMER, this.inactive, this);

  hub
    .on(E.PLAYER_SKIP_CLICKED, this._skip, this)
    .on(E.PLAYER_SCRUBBER_END, this._seek, this)
    .on(E.PLAYER_REPLAY_SET, this._handleReplay, this)
    .on(E.PLAYER_REPLAY_SKIP, this._skip, this)
    .on(E.PLAYER_RESTART_OD, this.restartSong, this)
    .on(E.PLAYER_PREVIOUS_OD, this.previousSong, this)
    .on(E.PLAYER_RESET_STATION, this.loadStationFromHistory, this);
};

Player.prototype.profileChanged = function profileChanged(
  profile,
  prevProfile,
) {
  if (prevProfile.profileId !== profile.profileId) {
    this.initialized = false;
  }

  if (
    !this.initialized &&
    profile.profileId &&
    profile.subInfoLoaded &&
    profile.listenHistoryReceived
  ) {
    this.initialized = true;
    this._webPlayer.stop();
    this.initialStationLoadedPromise = this.intitializeWebPlayer()
      .then(() => this.loadInitialStation())
      .catch(e => {
        const errObj = e instanceof Error ? e : new Error(e);
        logger.error(CONTEXTS.PLAYER, e, {}, errObj);
        this.loadStationFromHistory();
      });
  }

  this._setTrackingData(profile);
};
// https://jira.ihrint.com/browse/WEB-11258
Player.prototype._initializeTracking = function _initializeTracking() {
  this._setTrackingData({
    birthYear: 0,
    preferences: {
      'fb.publishing': 0,
    },
  });
};

Player.prototype.loadInitialPlaylist = function loadInitialPlaylist() {
  const state = store.getState();
  const seedId = getCurrentSeedId(state);
  const ownerId = getCurrentOwnerId(state);
  if (!seedId || !ownerId)
    return Promise.reject(
      new Error('Cannot get playlist without ownerId and stationId'),
    );
  return resolveStation({
    opts: { playedFrom: PLAYED_FROM.DEFAULT },
    stationId: seedId,
    stationType: STATION_TYPE.COLLECTION,
  }).then(() =>
    this._createRadio(
      getCurrentStationType(store.getState(), { seedId }),
      seedId,
      PLAYED_FROM.DEFAULT,
      { noPlay: true, partialLoad: true, userId: ownerId },
    ),
  );
};

Player.prototype.loadPodcast = function loadPodcast() {
  const pageId = getResourceId(store.getState());
  const episodeId =
    getCurrentEpisodeId(store.getState()) ||
    get(getCurrentPodcastEpisodes(store.getState()), '[0].id');
  return this._createRadio(STATION_TYPE.PODCAST, pageId, PLAYED_FROM.DEFAULT, {
    mediaId: episodeId,
    noPlay: true,
    partialLoad: true,
  });
};

const loadPodcastEpisodes = station => {
  const stationId = station.seedId;
  const state = store.getState();
  const ampUrl = getAmpUrl(state);
  const { profileId, sessionId } = getCredentials(state);
  return transport(
    getEpisodes({ ampUrl, id: stationId, limit: 20, profileId, sessionId }),
  );
};

/*
 * This function will call episodes for the current station in the player
 * and populate the store with those episodes and create radio from the first
 * episode returned
 */
Player.prototype.loadPodcastFromHistory = async function loadPodcastFromHistory(
  station,
) {
  const stationId = station.seedId;
  const episodesPromise = loadPodcastEpisodes(station).then(({ data }) => data);

  const episodesData = await episodesPromise;
  const episodes = get(episodesData, 'data', []);
  const episodeIds = episodes.reduce(
    (ids, { id: reducedEpisodeId }) => [...ids, reducedEpisodeId],
    [],
  );
  store.dispatch(setPodcastEpisodes(episodes));
  store.dispatch(setPodcastProfile({ episodeIds, seedId: stationId }));
  const episodeId = get(episodes, '[0].id');

  return this._createRadio(
    STATION_TYPE.PODCAST,
    stationId,
    PLAYED_FROM.DEFAULT,
    {
      mediaId: episodeId,
      myMusicType: station.myMusicType,
      noPlay: true,
      partialLoad: true,
    },
  );
};

Player.prototype.loadFavorites = function loadFavorites() {
  return this._createRadio(
    STATION_TYPE.FAVORITES,
    getResourceId(store.getState()),
    PLAYED_FROM.DEFAULT,
    { noPlay: true, partialLoad: true },
  );
};

/* ZS - WEB-11055 -
 * This function handles loading of the initial station when the page boots. The logic is documented
 * at: https://wiki.ihrint.com/display/PM/Default+Station+Player+Logic
 * I've recommended that we add a country-specific fallback for situations where amp services are
 * unreachable/down, but we haven't really gone anywhere on implementing that
 */
Player.prototype.loadInitialStation = function loadInitialStation() {
  const reduxState = store.getState();
  const pageId = getResourceId(reduxState);
  const namespace = getRouteNamespace(reduxState);
  const routeParams = getRouteParams(reduxState);
  const isSubDirectory = getIsSubDirectory(reduxState);
  const hasCustom = getCustomRadioEnabled(reduxState);
  const initialCreateRadioOptions = { noPlay: true, partialLoad: true };
  const prevState = playerState.getStoredState();
  let stationType;
  let stationId;

  const prevStation = prevState.station;

  // We're playing something after authentication
  if (authLoad.load() === 'createRadio') return this;

  // Priority in which stations are loaded is ordered per WEB-8339 WEB-3458
  if (namespace === 'news' && this.articleArtist && hasCustom) {
    return this._createRadio(
      STATION_TYPE.ARTIST,
      this.articleArtist,
      PLAYED_FROM.DEFAULT,
      initialCreateRadioOptions,
    );
  }

  // genre and my/ are the odd ducks in this stuff since they're the only profile pages that don't have the
  // station that should be loaded available as part of the url. We have to maintain the mapping
  // in memory
  const genreId = getCurrentGenreSparkStreamId(reduxState);
  if (namespace === 'genre' && genreId) {
    return this._createRadio(
      STATION_TYPE.LIVE,
      genreId,
      PLAYED_FROM.DEFAULT,
      initialCreateRadioOptions,
    );
  }

  const favoritesSeedId = getFavoritesSeedId(reduxState);
  if (namespace === 'my/' && favoritesSeedId && hasCustom) {
    return this._createRadio(
      STATION_TYPE.FAVORITES,
      favoritesSeedId,
      PLAYED_FROM.DEFAULT,
      initialCreateRadioOptions,
    );
  }

  if (namespace === 'content' && getArtistId(reduxState) && hasCustom) {
    return this._createRadio(
      STATION_TYPE.ARTIST,
      getArtistId(reduxState),
      PLAYED_FROM.DEFAULT,
      {
        ...initialCreateRadioOptions,
        noRegGate: true,
      },
    );
  }
  // we check for country code because of how the live directory page works
  if (namespace === 'favorites' && pageId) return this.loadFavorites();

  const isProfile = !isSubDirectory && !routeParams?.countryCode && pageId;
  if (namespace === 'live' && isProfile) {
    return this._createRadio(
      STATION_TYPE.LIVE,
      pageId,
      PLAYED_FROM.DEFAULT,
      initialCreateRadioOptions,
    );
  }

  if (namespace === 'artist' && isProfile && hasCustom) {
    return this._createRadio(
      STATION_TYPE.ARTIST,
      pageId,
      PLAYED_FROM.DEFAULT,
      initialCreateRadioOptions,
    );
  }

  if (
    namespace === 'podcast' &&
    !isSubDirectory &&
    !routeParams?.countryCode &&
    pageId
  ) {
    return this.loadPodcast();
  }

  if (namespace === 'playlist') {
    return this.loadInitialPlaylist();
  }

  if (prevStation && prevStation.type && prevStation.id) {
    stationType = prevStation.type;
    stationId = prevStation.id;
    const { myMusicType, userId } = prevStation;

    if (!isPlaylist(stationType)) {
      return this._createRadio(stationType, stationId, PLAYED_FROM.DEFAULT, {
        myMusicType,
        noPlay: true,
        partialLoad: true,
        userId,
      });
    }
  }

  return this.loadStationFromHistory();
};

Player.prototype.loadStationFromRecs = function loadStationFromRecs() {
  const reduxState = store.getState();
  const liveRadioEnabled = getLiveRadioEnabled(reduxState);
  const customRadioEnabled = getCustomRadioEnabled(reduxState);
  if (!liveRadioEnabled && !customRadioEnabled) return Promise.resolve();

  return store.dispatch(fetchInitialRecs()).then(() => {
    const recsData = getForYouRecs(store.getState());
    /**
     * If we get to this point, it means that the user is anonymous and they
     * have no listening history. We then load the first live station rec into
     * the player. If and only if there are no live station recommendations, we
     * load the first custom radio station rec into the player. Never default
     * to custom radio recs or else we might have another Drake-pocalypse on our
     * hands.
     */
    let topStationIndex = recsData.findIndex(
      ({ subType }) => subType === 'LIVE',
    );
    if (topStationIndex < 0)
      topStationIndex = recsData.findIndex(({ type }) => type === 'CR');
    const { seedId, seedType } = get(
      recsData,
      [topStationIndex, 'content'],
      {},
    );

    if (!seedId || !seedType) {
      return this._queueLocalStation(undefined, {
        noPlay: true,
        partialLoad: true,
      });
    }

    return this._createRadio(seedType, seedId, PLAYED_FROM.DEFAULT, {
      noPlay: true,
      partialLoad: true,
    });
  });
};

Player.prototype.loadStationFromHistory = function loadStationFromHistory(
  options = {},
) {
  return whenPopulated(store, getListenHistoryReceived)
    .then(() => {
      const hasCustom = getCustomRadioEnabled(store.getState());

      // set track to empty state
      playerState.set('track', null);

      const [mostRecentStation] = getListenHistory(store.getState()).filter(
        item => hasCustom || get(item, 'seedType') !== STATION_TYPE.ARTIST,
      );

      const stationType = get(mostRecentStation, 'seedType');
      const stationId = get(mostRecentStation, 'seedId');

      if (stationType && stationId) {
        if (stationType === STATION_TYPE.PODCAST) {
          return this.loadPodcastFromHistory(mostRecentStation);
        }

        return this._createRadio(stationType, stationId, PLAYED_FROM.DEFAULT, {
          myMusicType: get(mostRecentStation, 'myMusicType'),
          noPlay: true,
          partialLoad: true,
          ...options,
        });
      }

      return this.loadStationFromRecs();
    })
    .catch(e => {
      const errObj = e instanceof Error ? e : new Error(e);
      logger.error(CONTEXTS.PLAYER, e, {}, errObj);
      this.loadStationFromRecs();
    });
};

Player.prototype.restartSong = function restartSong() {
  this._player.setPlayedFrom(PLAYED_FROM.PLAYER_REWIND);
  this._player.restartSong();
};

Player.prototype.previousSong = function previousSong() {
  this._player.setPlayedFrom(PLAYED_FROM.PLAYER_REWIND);
  return this._player.back();
};

Player.prototype.seekToPlayerPosition = function seekToPlayerPosition() {
  // Record position here since it'll change once TIME is triggered
  const position = playerState.get('position');

  hub.once(E.PLAY, () => {
    hub.once(E.TIME, () => {
      this._seek(position);
    });
  });
};

Player.prototype._resume = function _resume(
  playedFrom = playerState.getTracking().playedFrom,
) {
  const track = playerState.getTrack();
  const station = playerState.getStation();

  this._player.setState(playerState);

  this._player.loadStation(
    station,
    { playedFrom },
    {
      autoplay: true,
      mediaId: track && track.id,
    },
  );

  if (track) {
    this.seekToPlayerPosition(track);
  }
};

Player.prototype._onChromecastConnected = function _onChromecastConnected() {
  // Set state to a dummy one
  this._webPlayer.stop();
  this._webPlayer.setState(PlayerState.getDummyState());

  this._player = this._chromecast;
  this._player.setState(playerState);
};

Player.prototype._onChromecastDisconnected =
  function _onChromecastDisconnected() {
    // Switch players here
    this._chromecast.setState(PlayerState.getDummyState());

    this._player = this._webPlayer;
    this._resume();
  };

Player.prototype._onChromecastVolumeChange = function _onChromecastVolumeChange(
  vol,
) {
  this._webPlayer.volume(vol * 100);
};

Player.prototype._onChromecastMutedChange = function _onChromecastMutedChange(
  muted,
) {
  if (muted) {
    this._webPlayer.mute();
  } else {
    this._webPlayer.unmute();
  }
};

/**
 * Set tracking data
 * @param {Object} demographics        Demographics info from user
 */
// Remove from player https://jira.ihrint.com/browse/WEB-11258
Player.prototype._setTrackingData = function _setTrackingData({
  age,
  birthYear,
  deviceId,
  gender,
  preferences,
  profileId,
}) {
  const fbPublishingEnabled =
    preferences ? preferences['fb.publishing'] || 0 : 0;
  const countryCode = getCountryCode(store.getState());
  const trackingData = {
    at: 0,
    birthYear,
    campid: query.campid,
    cid: query.cid,
    clientType: 'web',
    fb_broadcast: fbPublishingEnabled,
    host: `webapp.${countryCode || 'US'}`,
    init_id: 8169,
    keyid: query.keyid,
    modTime: Date.now(),
    pname: query.pname || 'OrganicWeb',
    profileid: profileId,
    territory: countryCode,
    uid: deviceId,
  };

  trackingData.age = Number(age) || 'null';
  trackingData.birthYear = Number(birthYear) || 'null';

  switch (gender ? gender.toLowerCase() : null) {
    case 'gender.male':
    case 'male':
      trackingData.gender = 1;
      break;
    case 'gender.female':
    case 'female':
      trackingData.gender = 2;
      break;
    case 'gender.unspecified':
    case 'unspecified':
      trackingData.gender =
        getCountryCode(store.getState()) === 'US' ? 'null' : 3;
      break;
    default:
      trackingData.gender = 'null';
      break;
  }

  trackingData['aw_0_1st.playerid'] = 'iHeartRadioWebPlayer';
  trackingData['aw_0_1st.skey'] = Math.floor(Date.now() / 1000);
  const state = store.getState();

  trackingData.terminalid = getTerminalId(state);

  playerState.setGlobalTracking(trackingData);
};

/**
 * Queue a local station
 */
Player.prototype._queueLocalStation = function _queueLocalStation(
  trackingData,
  opts = {},
) {
  const countryCode = getCountryCode(store.getState());
  const ampUrl = getAmpUrl(store.getState());
  return transport(
    liveStations({
      ampUrl,
      filters: {
        countryCode,
        limit: 1,
        useIP: true,
      },
    }),
  ).then(res => {
    const stations = get(res, ['data', 'hits'], []);
    if (stations && stations.length) {
      return this._player.loadSeedStation(
        stations[0].id,
        STATION_TYPE.LIVE,
        trackingData,
        opts,
      );
    }
    return undefined;
  });
};

Player.prototype._onPlayToggle = function _onPlayToggle(opts = {}) {
  const station = playerState.getStation();
  let seedType;
  let seedId;
  const track = playerState.getTrack();
  const currentTrackIsReplay = track && !!track.get('isReplay');

  if (playerState.get('notActiveStreamer')) {
    this.postActiveStreamer();
  }

  if (station) {
    seedType = station.get('seedType');
    seedId = station.get('seedId');
  }

  if (playerState.isIdle() || playerState.isPaused()) {
    if (opts.playedFrom)
      playerState.setTracking({ playedFrom: opts.playedFrom });

    if (this._player !== this._chromecast && station.partialLoad) {
      // partialLoad means the station isn't really loaded into the player, so must createRadio() to play
      return this._createRadio(seedType, seedId, opts.playedFrom, {
        mediaId: station.get('mediaId'),
      });
    }

    if (this._player === this._chromecast) {
      this._player.setState(playerState);
      if (track) {
        this.seekToPlayerPosition(track);
      }
    }

    store.dispatch(setIsWarmingUp(true));
    return this._play();
  }

  if (seedType === 'live' && !currentTrackIsReplay) {
    return this._stop();
  }
  if (seedType === STATION_TYPE.PODCAST) {
    const position = playerState.get('position');
    const podcastId = station.id;
    const episodeId = station.get('track').get('id');
    store.dispatch(updatePodcastPlayProgress(position, podcastId, episodeId));
    // IHRWEB-14904 stop podcasts from playing in the background when all episodes are played
    return this._stop();
  }

  return this._pause();
};

Player.prototype._throttledCreateRadio = throttle(
  function _throttledCreateRadio(...args) {
    // Make sure player is initialized before a station is created
    return this.isReady().then(() => {
      this._createRadio(...args);
    });
    // NOTE: becuase the app is crazy unpredictable we cannot easily change this value,
    // but a 1500 sec throttle is totally unacceptable. This needs to be refactored.
  },
  1500,
);

/**
 * Creates radio station
 * This is the primary (and basically only) entrypoint to actually start playing content. From the
 * hub side it generally means triggering CREATE_RADIO, which goes through the throttle then gets
 * to this
 * @param  {Object} opts Options
 *  partialLoad   If true, then station is only partially loaded
 */

/* eslint-disable consistent-return */
Player.prototype._createRadio = async function _createRadio(
  type,
  seedId,
  playedFrom,
  options = {},
) {
  logger.info(
    [CONTEXTS.PLAYBACK, CONTEXTS.CREATE_RADIO],
    cloneDeep({ options, playedFrom, seedId, type }),
    { toRum: true },
  );
  const reduxState = store.getState();
  const translate = getTranslateFunction(reduxState);
  const countrySupported = supportedCountries.includes(
    getCountryCode(reduxState),
  );
  const opts = { ...options };

  // opts.preventNativeUpsell should never be undefined, but this is here just in case - default is NOT to prevent
  if (typeof opts.preventNativeUpsell === 'undefined') {
    opts.preventNativeUpsell = false;
  }
  let seedType = type;

  const { profileId, isAnonymous, isLoggedOut, isAuthenticated, isInApp } =
    createRadioSelector(reduxState);

  if (isInApp) return;

  if (!isAuthenticated) {
    throw new Error(
      'Cannot create radio before authenticating as anonymous or real user. Talk to Sam.',
    );
  }

  if (
    !playerState.get('inInit') &&
    [...ON_DEMAND_TYPES, ...CUSTOM_TYPES].includes(seedType)
  ) {
    this.postActiveStreamer();
  }

  // when a new station is created, make sure the position from the old track
  // does not persist
  this._resetPosition();

  /* ZS - WEB-11055
   * much of the logic below needs to be hoisted out of this and moved to onclick handlers/invocation points
   * there's way too much conditional logic that is tied to a specific playback mode, rather than the generalities
   * of starting playback itself
   */
  // if user is playing a track with song2start, and it is not in catalog, show growl before switching to track radio
  if (
    opts.song2Start &&
    opts.isOnDemandTrack === false &&
    seedType === STATION_TYPE.TRACK
  ) {
    store.dispatch(
      showNotifyGrowl({
        title: translate('This song is not available to start your station.'),
      }),
    );
  }

  // WEB-13647 - 5/10/19 - AV
  // check if the playlist is playable based on type and entitlements.  If it isn't then pop an
  // alert telling them to upgrade and boot them out of the playback lifecycle before it's too late.
  const playlistType = getCurrentType(reduxState);

  if (
    ((seedType === STATION_TYPE.COLLECTION &&
      !canPlayPlaylistOD(reduxState, { seedId })) ||
      (seedType === STATION_TYPE.PLAYLIST_RADIO &&
        !canPlayPlaylistRadio(reduxState, { seedId }))) &&
    !isAnonymous &&
    playlistType !== PlaylistTypes.Default &&
    playlistType !== PlaylistTypes.User
  ) {
    // note: if user is anonymous we'll reg-gate them instead (ctrl-f trackingContext)
    // UPSELL: can't play playlists
    store.dispatch(
      showNotifyGrowl({
        title: translate('Play this on web with All Access'),
        description: translate(
          'Subscribe today for unlimited access to playlists',
        ),
      }),
    );

    // [IHRWEB-15236] Handle when non AA users tries to play custom playlist, don't break player, instead play last played.
    const [lastPlayed] = getListenHistory(store.getState());
    const { stationType, seedId: lastSeedId } = lastPlayed;
    return this._createRadio(stationType.toLowerCase(), lastSeedId, playedFrom);
  }

  if (seedType === STATION_TYPE.ALBUM && !playAlbumSelector(reduxState)) {
    // change the seedType back to artist, we want to be playing DMCA radio
    seedType = STATION_TYPE.ARTIST;

    if (showAlbumUpsellSelector(reduxState)) {
      if (!opts.preventNativeUpsell) {
        store.dispatch(
          openUpsellModal({
            upsellFrom: UPSELL.ALBUM_HEADER_PLAY,
            headerCopy: translate(
              'Play the whole album with iHeart All Access.',
            ),
            analyticsUpsellFrom: UPSELL_FROM.ALBUM_PROFILE_ALBUM_HEADER_PLAY,
          }),
        );
      }
      try {
        // IHRWEB-15803: artistId may not be immediately available if player not initialized yet - MP
        const currentArtistId = await whenPopulated(store, getCurrentArtistId);
        // IHRWEB-15770: artist radio playback during upsell - MP
        return this._createRadio(seedType, currentArtistId, playedFrom);
      } catch (e) {
        const errObj = e instanceof Error ? e : new Error(e);
        return logger.error(CONTEXTS.PLAYER, e, {}, errObj);
      }
    }
  }

  const unsupportedLiveStation =
    !countrySupported || seedType === STATION_TYPE.LIVE;
  const unplayableStation =
    this.unplayableStation &&
    this.unplayableStation.seedId === seedId &&
    this.unplayableStation.seedType === seedType;
  const cantPlayLive = unsupportedLiveStation && unplayableStation;
  const cantPlayCustom =
    CUSTOM_TYPES.includes(seedType) && !getCustomRadioEnabled(reduxState);

  if ((cantPlayLive || cantPlayCustom) && !opts.partialLoad) {
    if (!opts.noPlay) {
      store.dispatch(
        openModal({
          id: ConnectedModals.Alert,
          context: AlertContexts.StationUnavailable,
        }),
      );
    }

    if (opts.autoPlay) {
      opts.partialLoad = true;
      opts.noPlay = true;
    } else {
      return;
    }
  }

  // Defer this after card change happens
  // For some mysterious reason, w/o this synchronization, firing ads tag too much will fuck up GPT
  if (opts.deferAfterCardChange) {
    const willBePlayable = !isLoggedOut || seedType === STATION_TYPE.LIVE;
    if (willBePlayable && !opts.noPlay && !!this._player.startWarmup) {
      this._player.startWarmup(opts.mediaId);
    }

    return hub.once(
      E.CARD_CHANGE,
      this._createRadio.bind(this, seedType, seedId, playedFrom, {
        ...opts,
        deferAfterCardChange: false,
      }),
    );
  }

  // Remove the authLoad createRadio queue since we're loading another station
  authLoad.remove('createRadio');

  // startWarmup NOW so we can keep the connection to the 'onClick'
  if (!opts.noPlay && !!this._player.startWarmup) {
    this._player.startWarmup(opts.mediaId);
  }

  // should this not
  Promise.all([
    resolveStation({
      myMusicType: opts.myMusicType,
      partialLoad: opts.partialLoad,
      playedFrom,
      stationId: seedId,
      stationType: seedType,
      trackId: opts.mediaId,
    }),
    (
      opts.partialLoad || getAds(reduxState).enable_triton_token // if we aren't about to play a station then we don't need the secure token
    ) ?
      Promise.resolve()
    : rejectPromiseOnTimeout(
        whenPopulated(store, getTritonPartnerIds, partnerIds =>
          Boolean(partnerIds?.['triton-uid']),
        ).then(() => store.dispatch(getTritonSecureToken())),
        5000,
      ) // make sure we have the triton secure token before attempting playback
        .catch(e => {
          logger.error(
            [CONTEXTS.PLAYER, CONTEXTS.TRITON, 'getTritonSecureToken'],
            `error fetching triton secure token, ${e.message || e}`,
            e,
          );
        }),
  ])
    .then(([data]) => {
      store.dispatch(
        setStation({
          id: seedId,
          playedFrom,
          subType: opts.myMusicType,
          type: seedType,
        }),
      );

      const Model = getStationModel(seedType);
      const reportingStationType =
        playlistType === PlaylistTypes.Default ? 'my_playlist' : null;
      const station = new Model({
        ...data,
        myMusicType: opts.myMusicType,
        playedFrom,
        reportingStationType,
      });

      if (opts.position) {
        station.set('position', opts.position);
      }

      station.set('mediaId', opts.mediaId);
      if (opts.trackUuid) station.set('uniqueTrackId', opts.trackUuid);
      const failures = station.get('failures');
      if (failures && failures.size) station.set('failures', new Map());

      const promise = Promise.resolve(station);

      const stationUrl = station.get('url');
      const { queryId, queryIdScope } = getSearch(store.getState());
      if (
        queryIdScope &&
        stationUrl &&
        stationUrl !== '/' &&
        pathIsChildOrParent(stationUrl, queryIdScope)
      ) {
        station.set('queryId', queryId);
      }

      if (opts.partialLoad) {
        // we only want to partially load the station, ie. give the illusion that it's loaded
        return promise.then(fetchedStation => {
          /**
           * We must check for the existence of 'seedId' here and not 'id'. 'id'
           * is possibly undefined due to the partialLoad flow and in this case we
           * would enter an infinite loop.
           */
          if (!fetchedStation.get('seedId')) {
            return this.loadStationFromHistory(opts);
          }
          try {
            this._player.loadStation(
              fetchedStation,
              { playedFrom },
              {
                autoplay: !opts.noPlay,
                mediaId: opts.mediaId,
                partialLoad: true,
              },
            );
          } catch (e) {
            logger.error(CONTEXTS.PLAYER, e, {}, e);
            this._onCreateStationError(
              this,
              seedType,
              seedId,
              playedFrom,
              opts,
            );
          }
        });
      }

      const stationSoftgate = getStationSoftgate(store.getState());
      // If we're already authed, go ahead and load the thing
      const signupBlocked = getCountryCode(reduxState) === 'WW';

      if (signupBlocked || !isLoggedOut || stationSoftgate[seedType]) {
        return promise.then(() => {
          const shouldArtist2Start =
            seedType === 'artist' && artistToStartSelector(reduxState);
          const shouldSong2Start =
            seedType === 'track' && songToStartSelector(reduxState);

          // we should not cache failures in playlists, we should try to refetch streams in case
          // something has changed
          if (seedType === STATION_TYPE.COLLECTION) {
            station.set('failures', new Map());
          }

          // set the seed if entitled for artist2start or song2start
          // and set isNew to true to force playing track/artist
          if (shouldArtist2Start || shouldSong2Start) {
            station.set({ isNew: true, seed: { id: seedId, type: seedType } });
          }

          this._player.loadStation(
            station,
            { playedFrom },
            {
              autoplay: !opts.noPlay,
              mediaId: opts.mediaId,
            },
          );
        });
      }

      // Queue this up so that station resumes automatically if authed
      if (!opts.noPlay) {
        hub.trigger(
          E.AUTH_LOAD_HANDLE,
          'createRadio',
          seedType,
          seedId,
          playedFrom,
          {
            mediaId: opts.mediaId,
          },
        );
      }

      let trackingContext;

      if (pageStore.getState().pageType === 'news') {
        trackingContext = 'news_play';
      } else if (isPlaylist(seedType)) {
        trackingContext = 'playlist_play';
      } else if (seedType === 'favorites') {
        trackingContext = `${
          seedId === profileId ? 'my' : 'shared'
        }_favorites_play`;
      } else if (seedType === STATION_TYPE.COLLECTION) {
        trackingContext = 'playlist_play';
      } else {
        trackingContext = `${seedType}_play`;
      }

      store.dispatch(openSignupModal({ context: trackingContext }));

      // if we're warming up and popping a modal we'll want to put the player back into a resting state
      if (getIsWarmingUp(store.getState())) {
        store.dispatch(setIsWarmingUp(false));
      }

      // Queue local station if there's no loaded station
      if (!playerState.getStation()) this._queueLocalStation();

      return undefined;
    })
    .catch(err => {
      this._handleError(err);
    });

  // let listen history client side createStation on play click, not site load.
  if (seedId !== String(profileId))
    store.dispatch(setListenHistory(profileId, { seedId, seedType, type }));
};
/* eslint-enable consistent-return */

Player.prototype._onCreateStationError = function _onCreateStationError(
  type,
  id,
  playedFrom,
  opts,
  err,
) {
  const translate = getTranslateFunction(store.getState());

  // no songs in playlist
  if (err.empty) {
    throw err;
  }

  if (err.code === 401) {
    hub.trigger(E.AUTH_LOAD_HANDLE, 'createRadio', type, id, playedFrom, opts);
    throw err;
  }

  // intercept 500 if exceeded station limit.
  try {
    const error =
      err.payload && err.payload.firstError ? err.payload.firstError : {};
    const listenHistoryHTML = `<a href="/my/history/">${translate(
      'Listen History',
    )}</a>`;
    switch (error.code) {
      // 2 is invalid session, don't popup
      case 2:
        hub.trigger(
          E.AUTH_LOAD_HANDLE,
          'createRadio',
          type,
          id,
          playedFrom,
          opts,
        );
        break;
      case 4:
        store.dispatch(
          showNotifyGrowl({
            title: translate('Custom Stations Limit Exceeded'),
            description: translate(
              'Please delete some stations from your account under {listenHistoryLink} before creating new stations.',
              { listenHistoryLink: listenHistoryHTML },
            ),
          }),
        );
        break;
      case 617:
        store.dispatch(
          showNotifyGrowl({
            title: translate(
              'Sorry, this station has run out of songs to play.',
            ),
          }),
        );
        break;
      default:
        store.dispatch(
          showNotifyGrowl({
            title: translate('Oops'),
            description: translate(
              "We don't have enough info to create a custom station right now. We'll let our DJs know.",
            ),
          }),
        );
        break;
    }
  } catch (exception) {
    // No errors? Ignore
  }

  throw err;
};

Player.prototype.setupTimer = function setupTimer(
  idleTimeout,
  liveIdleTimeout,
) {
  this.idleTimeout = idleTimeout;
  this.liveIdleTimeout = liveIdleTimeout;

  hub.on(E.PLAY, this.timerHandlePlay, this);
};

Player.prototype.timerHandlePlay = function timerHandlePlay() {
  const station = playerState.getStation();
  const stationType =
    station ? getStationType(station.get('seedType')) : undefined;
  const idleTime =
    stationType === 'live' ? this.liveIdleTimeout : this.idleTimeout;

  this.startIdleTimer(idleTime);

  hub.off(E.PLAY, this.timerHandlePlay, this); // play gets called on track changes, so ignore
  hub.on(
    [E.STOP, E.PAUSE, E.STATION_LOADED].join(' '),
    this.timerHandleStop,
    this,
  );
};

Player.prototype.timerHandleStop = function timerHandleStop() {
  this.stopIdleTimer();
  hub.off(
    [E.STOP, E.PAUSE, E.STATION_LOADED].join(' '),
    this.timerHandleStop,
    this,
  );
  hub.on(E.PLAY, this.timerHandlePlay, this);
};

Player.prototype.startIdleTimer = function startIdleTimer(time) {
  this.stopIdleTimer();
  this.idleTimer = setTimeout(() => {
    hub.trigger(E.PLAYER_PLAY_TOGGLED);

    store.dispatch(
      openModal({
        id: ConnectedModals.Confirm,
        context: ConfirmContexts.IdleCheck,
      }),
    );
  }, time);
};

Player.prototype.stopIdleTimer = function stopIdleTimer() {
  clearTimeout(this.idleTimer);
};

Player.prototype._handleReplay = function _handleReplay(track) {
  const translate = getTranslateFunction(store.getState());
  const replayStation = track.get('replayStation');
  const stationType = replayStation.get('seedType');
  const stationId = replayStation.id;

  // live is the only replay scenario that requires a exclusive amp request to resolve the track.
  if (stationType === STATION_TYPE.LIVE) {
    return this._fetchReplayTrackForLive(track, stationId)
      .then(fetchedTrack => this._setReplay({ track: fetchedTrack }))
      .catch(e => {
        const errObj = e instanceof Error ? e : new Error(e);
        logger.error(
          CONTEXTS.PLAYBACK,
          { e, message: 'Failed Replay' },
          {},
          errObj,
        );

        store.dispatch(
          showNotifyGrowl({
            title: translate('Replay failed'),
          }),
        );
      });
  }

  return this._setReplay({ track });
};

// returns a promise that resolves to a track to be used to replay something out of live radio.
Player.prototype._fetchReplayTrackForLive = function _fetchReplayTrackForLive(
  track,
  stationId,
) {
  const trackId = track.get('id');
  const reduxState = store.getState();
  const host = getHost(reduxState);
  const profileId = getProfileId(reduxState);
  const sessionId = getSessionId(reduxState);
  const ampUrl = getAmpUrl(reduxState);
  return transport(
    postStreams({
      ampUrl,
      host,
      playedFrom: PLAYED_FROM.PLAYER_REPLAY,
      profileId,
      sessionId,
      stationId: String(stationId),
      stationType: STATION_TYPE.LIVE.toUpperCase(),
      trackIds: [trackId],
    }),
  ).then(({ data: { items } }) => {
    if (items.length) {
      const [newTrack] = items;
      const { streamUrl: url, reportPayload } = newTrack;
      const newTrackInfo = {
        attrs: {
          ...newTrack.content,
          reportPayload,
          stream: { url },
        },
        id: newTrack.content.id,
      };
      const replayTrack = merge({}, track, newTrackInfo);

      return replayTrack;
    }

    const errorObj = new Error('No stream found for replay');
    logger.error(
      CONTEXTS.PLAYBACK,
      'No stream found for replay.',
      {},
      errorObj,
    );

    return Promise.reject(errorObj);
  });
};

// actually sets the playerState with the current replay track.
// when passing undefined the player replays the current track.
Player.prototype._setReplay = function _setReplay({ track }) {
  // make station a model as well
  const station = toModel(track.get('replayStation'), Station);
  const newTrack = toModel(track, Media);

  // reset track reported state and replace replayStation with the model version
  newTrack.set({
    replayStation: station,
    reported: {},
  });

  playerState.setReplayState(newTrack);
  this._triggerReplay(track, station);
};

Player.prototype._triggerReplay = function _triggerReplay() {
  const updatedTracking = {
    ...playerState.getTracking(),
    playedFrom: PLAYED_FROM.PLAYER_REPLAY,
  };
  playerState.setTracking(updatedTracking);

  // Do a next tick so we break from the Hub event stack trace
  setTimeout(this._player._next, 0);
};

// Pure wrappers since _player got changed in runtime
Player.prototype._play = function _play() {
  return this._player.play();
};

Player.prototype._pause = function _pause() {
  return this._player.pause();
};

Player.prototype._stop = function _stop() {
  return this._player.stop();
};

Player.prototype._seek = function _seek(time) {
  return this._player.seek(time);
};

Player.prototype._skip = function _skip() {
  // ensure that the position of the next track will start at zero
  this._resetPosition();
  this._player.getState().setTracking({ playedFrom: PLAYED_FROM.PLAYER_SKIP });
  return this._player.skip();
};

// Used for podcasts
Player.prototype._seekRelative = function _seekRelative(time) {
  const position = this._player.getPosition();
  const duration = this._player.getDuration();
  this._player.seek(
    time >= 0 ?
      Math.min(position + time, Math.floor(duration))
    : Math.max(position + time, 0),
  );
};

Player.prototype._onTime = function _onTime(timeObj = {}) {
  let pos;
  pos = timeObj.position;
  const dur = timeObj.duration;
  if (pos && pos < 0) pos = 0;

  playerState.setDuration(dur);

  if (playerState.getPlayingState() === 'PLAYING') {
    playerState.setPosition(pos);
  }
};

Player.prototype._ensureTrackStartsFromZero =
  function _ensureTrackStartsFromZero(timeObj) {
    if (timeObj.position < 1) {
      this._onTime(timeObj);
    }
    hub.on(
      // IHRWEB-15411 putting under flag to highlight for Web-Ads 2.0 implementation (MP)
      E.TIME,
      this._onTime,
      this,
    );
  };

Player.prototype._resetPosition = function _resetPosition() {
  playerState.setPosition(0);
};

function _handleNoMoreTracksError() {
  const translate = getTranslateFunction(store.getState());

  store.dispatch(
    showNotifyGrowl({
      title: translate('Sorry, this station has run out of songs to play.'),
    }),
  );
}

Player.prototype._handleError = function _handleError(err) {
  const moreSkips = moreSkipsSelector(store.getState());
  const { code } = err.payload ? err.payload.error || {} : {};
  const errObj = err instanceof Error ? err : new Error(err);

  if (code === 617 && moreSkips) {
    return _handleNoMoreTracksError();
  }

  store.dispatch(setIsWarmingUp(false)); // otherwise player remains in buffering state
  this._player.stop();
  this._state.setPlayingState(PLAYER_STATE.IDLE);
  // we're not handling this error yet.

  logger.error(CONTEXTS.PLAYBACK, err, {}, errObj);

  return undefined;
};

Player.prototype.inactive = function inactive() {
  this._pause();
  playerState.set('notActiveStreamer', true);
  store.dispatch(
    openModal({
      id: ConnectedModals.DeviceLimit,
    }),
  );
};

Player.prototype.becomeActive = function becomeActive() {
  // become the active streamer
  return this.postActiveStreamer().then(() => {
    // resume playback
    this._play();
  });
};

Player.prototype.updateSpeed = function updateSpeed(speed) {
  this._player._player.instance.setPlaybackRate(speed);
};

Player.prototype.postActiveStreamer = function postActiveStreamer() {
  const reduxState = store.getState();
  const profileId = getProfileId(reduxState);
  const sessionId = getSessionId(reduxState);
  const ampUrl = getAmpUrl(reduxState);

  return transport(
    setActiveStreamer({
      ampUrl,
      profileId,
      sessionId,
    }),
  ).then(() => {
    playerState.set('notActiveStreamer', false);
  });
};

export default Player;
