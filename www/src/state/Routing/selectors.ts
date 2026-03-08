import qs from 'qs';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import { getIdFromSlug } from './helpers';
import { getPlaylistIdFromSlug } from 'state/Playlist/helpers';
import { Location, State } from './types';
import { State as RootState } from 'state/types';

export type PlaylistInfo = {
  id?: string;
  owner?: string;
};

export const getRouting = createSelector<RootState, RootState, State>(
  (state: RootState): RootState => state,
  state => get(state, 'routing', {}) as State,
);

export const getParams = createSelector<
  RootState,
  State,
  Record<string, string>
>(getRouting, routing => get(routing, 'params', {}));

export const getSection = createSelector(getParams, params =>
  get(params, 'section', ''),
);

export const getHistory = createSelector(getRouting, routing =>
  get(routing, 'history', {}),
);

export const getLocation = createSelector(getRouting, routing => {
  const location = get(routing, 'location', {}) as Location;
  if ((location as any).length === 0 && __CLIENT__) {
    const { pathname, search } = window.location;
    return { pathname, search };
  }
  return location;
});

export const getCurrentPath = createSelector(getLocation, location => {
  const path = get(location, 'pathname') || '';
  return path.match('/$') ? path : `${path}/`;
});

export const getSearch = createSelector(
  getLocation,
  location => get(location, 'search') || '',
);

export const getQueryParams = createSelector(getLocation, location =>
  qs.parse(get(location, 'search') || '', { ignoreQueryPrefix: true }),
);

export const getPath = createSelector(
  getLocation,
  location => get(location, 'pathname') || '',
);

export const getHash = createSelector(
  getLocation,
  location => get(location, 'hash') || '',
);

export const getRouteParams = createSelector(getRouting, routing =>
  get(routing, 'params', {}),
);

export const getRouteNamespace = createSelector<RootState, string, string>(
  getCurrentPath,
  pathName => {
    const [, first, second] = pathName.split('/');
    // this is designed to handle /my correctly since it isn't really
    // a meaningful namespace in and of itself
    return first === 'my' ? `${first}/${second}` : first;
  },
);

export const getParentPath = createSelector(
  getRouteNamespace,
  getParams,
  getCurrentPath,
  getSearch,
  (namespace, params, path, search) => {
    const slugifiedId = get(params, 'slugifiedId');
    const parentPath = `/${namespace}/${get(params, 'slugifiedId')}/`;
    if (parentPath === path || !namespace || !slugifiedId) return null;
    return `${parentPath}${search || ''}`;
  },
);

export const getMyMusicSection = createSelector(
  getRouteNamespace,
  getCurrentPath,
  (namespace, pathName) => {
    const section = pathName.split('/')[3];

    return namespace === 'my/music' ? section : '';
  },
);

export const getCurrentEpisodeId = createSelector(getParams, params =>
  getIdFromSlug(get(params, 'episodeSlug')),
);

export const getSlugId = createSelector<RootState, Record<string, string>, any>(
  getParams,
  params =>
    getIdFromSlug(get(params, 'slugifiedId') || get(params, 'slugOrId')),
);

export const getPlaylistInfo = createSelector<
  RootState,
  Record<string, string>,
  PlaylistInfo
>(getParams, params => getPlaylistIdFromSlug(get(params, 'slugOrId')));

export const getPageInfo = createSelector(
  getRouting,
  routing => routing?.pageInfo ?? ({} as State['pageInfo']),
);

export const getResourceId = createSelector<
  RootState,
  string,
  string,
  PlaylistInfo,
  PlaylistInfo | string | null
>(
  getRouteNamespace,
  getSlugId,
  getPlaylistInfo,
  (routeNamespace, slugId, playlistInfo) => {
    if (routeNamespace === 'playlist' && playlistInfo.id && playlistInfo.owner)
      return playlistInfo;
    if (slugId) return slugId;
    return null;
  },
);

// WEB-8339 these are directory pages that look like they should
// have specific stations associated with them, but don't
export const getIsSubDirectory = createSelector(getCurrentPath, path =>
  ['live/country', 'playlist/collections', 'genre/', 'podcast/category'].some(
    subPath => path.includes(subPath),
  ),
);

export function makeGetQueryStringParam<T>(param: string, def: T) {
  return createSelector(getSearch, search => {
    const value = qs.parse(search.substring(1))[param];
    if (value === undefined) {
      return def;
    }
    return value;
  });
}

export const getAutoplay = makeGetQueryStringParam('autoplay', false);

export const getFromLearnMore = makeGetQueryStringParam('fromLearnMore', false);

export const getSearchQuery = makeGetQueryStringParam('q', '');

export const getHideSignup = makeGetQueryStringParam('hideSignup', false);

export const getAutomationTestingTurnedOn = makeGetQueryStringParam(
  'testAutomation',
  false,
);

export const getPname = makeGetQueryStringParam('pname', '');

export const getInternalNavCount = createSelector(getRouting, routing =>
  get(routing, 'internalNavCount', 0),
);

export const getIsFirstPageView = createSelector(
  getInternalNavCount,
  internalNavCount => internalNavCount <= 1,
);

export const getSlug = createSelector(getParams, params => get(params, 'slug'));

export const getSlugOrId = createSelector<
  RootState,
  Record<string, string>,
  string
>(getParams, params => get(params, 'slugOrId'));

export const getServerError = createSelector(getRouting, routing =>
  get(routing, 'serverError', {}),
);

export const getErrorCode = createSelector(getServerError, error =>
  get(error, 'code'),
);

export const getPreviousLocation = createSelector(getRouting, routing =>
  get(routing, 'previousLocation'),
);

export const getSectionId = createSelector(getParams, params =>
  getIdFromSlug(get(params, 'sectionId')),
);

export const getUrlCountry = createSelector(getParams, params =>
  get(params, 'countryCode', ''),
);

export const getForce404data = createSelector(
  getRouting,
  routing => routing?.force404data,
);
