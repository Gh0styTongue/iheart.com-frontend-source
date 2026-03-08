import ads from 'state/Ads';
import albums from 'state/Albums';
import analytics from 'modules/Analytics/middleware';
import artists from 'state/Artists';
import cookies from 'modules/Cookies/middleware';
import createAmpTransport from 'api/transport/createAmpTransport';
import createReducer from './createReducer';
import environment from 'state/Environment';
import events from 'state/Events';
import favorites from 'state/Favorites';
import genres from 'state/Genres';
import hero from 'state/Hero';
import hub from 'modules/Hub/middleware';
import live from 'state/Live';
import localStorageMiddleware from 'modules/LocalStorage/middleware';
import location from 'state/Location';
import logger from 'modules/Logger';
import mapLocationConfigToInitialState from './mapLocationConfigToInitialState';
import myMusic from 'state/MyMusic';
import news from 'state/News';
import playback from 'state/Playback';
import player from 'state/Player';
import playlist from 'state/Playlist';
import playlistDirectory from 'state/PlaylistDirectory';
import podcast from 'state/Podcast';
import promo from 'state/Promo';
import recs from 'state/Recs';
import routing from 'state/Routing';
import search from 'state/Search';
import searchNew from 'state/SearchNew';
import siteData from 'state/SiteData';
import social from 'state/Social';
import stations from 'state/Stations';
import targeting from 'state/Targeting';
import thunk from 'redux-thunk';
import tracks from 'state/Tracks';
import ui from 'state/UI';
import url from 'modules/Router/middleware';
import user from 'state/User';
import yourLibrary from 'state/YourLibrary';
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import { deobfuscate } from 'server/HTML/obfuscateUrls';
import { get, merge } from 'lodash-es';
import { getObfuscateUrls } from 'state/Features/selectors';
import { i18nState } from 'redux-i18n';
import { RECEIVE_LOCATION_CONFIG } from 'state/Config/constants';
import { reduxLogger } from 'modules/Logger/middleware';

let store = null;

const loggerMiddleware = {
  client: [reduxLogger],
  server: [],
};

const clientExecutionMiddleware = {
  client: [cookies, localStorageMiddleware, hub, analytics, url],
  server: [],
};

const sdkExecutionMiddleware = {
  client: [hub, cookies], // IHRWEB-14918 - add cookies to middleware so non-embeded sdk page can set session data
  server: [],
};

function getMiddleware(thunkParams) {
  const env = __CLIENT__ ? 'client' : 'server';

  let middleware = [
    thunk.withExtraArgument(thunkParams),
    ...loggerMiddleware[env],
  ];
  if (__CLIENT__ && window.location.href.indexOf('/sdk/auth') >= 0) {
    middleware = [...middleware, ...sdkExecutionMiddleware[env]];
  } else {
    middleware = [...middleware, ...clientExecutionMiddleware[env]];
  }

  return applyMiddleware(...middleware);
}

const composeEnhancers =
  (
    __DEV__ &&
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  ) ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
  : compose;

const allReducers = combineReducers({
  ads,
  albums,
  analytics: createReducer({}),
  artists,
  config: createReducer({}),
  configOverride: createReducer({}),
  environment,
  events,
  favorites,
  features: createReducer({ flags: {} }),
  genres,
  hero,
  i18nState,
  links: createReducer({}),
  live,
  location,
  myMusic,
  news,
  playback,
  player,
  playlist,
  playlistDirectory,
  podcast,
  promo,
  recs,
  routing,
  search,
  searchNew,
  siteData,
  social,
  stations,
  targeting,
  theme: createReducer({}),
  tracks,
  ui,
  user,
  yourLibrary,
});

export function masterReducer(state, action) {
  switch (action.type) {
    case RECEIVE_LOCATION_CONFIG:
      return allReducers(
        merge(
          {},
          state,
          mapLocationConfigToInitialState(
            action.payload,
            i18nState.lang,
            state.configOverride,
          ),
        ),
        action,
      );
    default:
      return allReducers(state, action);
  }
}

export function reduxFactory(initialState = {}, thunkParams = { logger }) {
  let reqStore;
  // the reqStore needs to be closured so that state/dispatch are specific to the server's current req.
  // (the top level store variable is not guaranteed to be req specific)
  const transport = createAmpTransport(() => reqStore);

  reqStore = createStore(
    masterReducer,
    initialState,
    composeEnhancers(getMiddleware({ transport, ...thunkParams })),
  );
  return reqStore;
}

if (__CLIENT__) {
  const bootstrapNode = document.getElementById('initialState');
  // Routes like /sdk/auth don't pass store
  if (bootstrapNode) {
    const { i18nState: i18n, ...baseState } = JSON.parse(
      bootstrapNode.textContent,
    );

    // before we expose our baseState to Redux, remove any instances of obfuscated URIs
    if (getObfuscateUrls(baseState) && get(baseState, 'links')) {
      baseState.links = deobfuscate(baseState.links);
    }

    store = reduxFactory(merge({}, baseState, { i18nState: i18n }));
    bootstrapNode.parentNode.removeChild(bootstrapNode);
  }
}

export default function getStore(state = {}, thunkParams) {
  if (!store) {
    store = reduxFactory(state, thunkParams);
  }

  return __CLIENT__ ? store : reduxFactory(state, thunkParams);
}
