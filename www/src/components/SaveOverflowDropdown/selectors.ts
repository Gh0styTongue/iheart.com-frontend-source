import PLAYED_FROM from 'modules/Analytics/constants/playedFrom';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import { getEntitlements } from 'state/Entitlements/selectors';
import { isPlaylist } from 'state/Playlist/helpers';
import { isSearchPlayedFrom } from './helpers';
import { STATION_TYPE } from 'constants/stationTypes';
import type { ComponentProps } from './types';
import type { Entitlements } from 'state/Entitlements/types';
import type { State as RootState } from 'state/types';

const getCatalogType = (_: RootState, { catalogType }: ComponentProps) =>
  catalogType;

const getIsOnDemandTrack = (
  _: RootState,
  { isOnDemandTrack }: ComponentProps,
) => isOnDemandTrack;

export function buildEntitlement(
  context = '',
  catalog = '',
  isShowEntitlement: boolean,
) {
  return [isShowEntitlement ? 'SHOW' : '', catalog, 'OVERFLOW', context, 'WEB']
    .filter(Boolean)
    .join('_');
}

export function buildShowEntitlement(context = '', catalog = '') {
  return buildEntitlement(context, catalog, true);
}

export const getCatalogPrefix = createSelector(
  [getCatalogType],
  catalogType => {
    if (catalogType === STATION_TYPE.TRACK) return 'TRACK';
    if (isPlaylist(catalogType)) return 'PLAYLIST';
    return '';
  },
);

const getPlayedFrom = (_: RootState, { playedFrom }: ComponentProps) =>
  playedFrom;

const playedFromLiveProfile = createSelector<
  RootState,
  ComponentProps,
  number,
  boolean
>(
  [getPlayedFrom],
  playedFrom =>
    playedFrom === PLAYED_FROM.PROF_LIVE_RAIL_RECENT ||
    playedFrom === PLAYED_FROM.RESP_WIDGET_LIVE_MAIN_RECENTLY_PLAYED,
);

const playedFromSearch = createSelector(getPlayedFrom, isSearchPlayedFrom);

export const getContextPrefix = createSelector<
  RootState,
  ComponentProps,
  boolean,
  boolean,
  'LIVEPF' | 'SEARCH' | ''
>([playedFromLiveProfile, playedFromSearch], (fromLive, fromSearch) => {
  if (fromLive) return 'LIVEPF';
  if (fromSearch) return 'SEARCH';
  return '';
});

export const determineCatalogEntitlement = createSelector(
  [getContextPrefix, getCatalogPrefix],
  buildShowEntitlement,
);

export const determineContextEntitlement = createSelector(
  [getContextPrefix],
  buildShowEntitlement,
);

const hasOverflowEntitlement = createSelector(
  [determineContextEntitlement, determineCatalogEntitlement, getEntitlements],
  (contextEntitlement, catalogEntitlement, allEntitlements) =>
    get(allEntitlements, contextEntitlement, false) ||
    get(allEntitlements, catalogEntitlement, false),
);

export const showOverflowSelector = createSelector(
  [hasOverflowEntitlement, getIsOnDemandTrack],
  (hasEntitlement, isOnDemandTrack) => isOnDemandTrack && hasEntitlement,
);

export const saveSongSelector = createSelector(
  [getCatalogType, getContextPrefix, getEntitlements],
  (catalogType, context, entitlements) =>
    catalogType === STATION_TYPE.TRACK &&
    get(entitlements, buildShowEntitlement(context, 'SAVE_TRACK')),
);

export const savePlaylistSelector = createSelector(
  [getCatalogType, getContextPrefix, getEntitlements],
  (catalogType, context, entitlements) =>
    catalogType === STATION_TYPE.TRACK &&
    get(entitlements, buildShowEntitlement(context, 'ADD_TRACK')),
);

export const addPlaylistToMyMusicSelector = createSelector<
  RootState,
  ComponentProps,
  string,
  string,
  Entitlements,
  boolean
>(
  [getCatalogType, getContextPrefix, getEntitlements],
  (catalogType, context, entitlements) =>
    isPlaylist(catalogType) &&
    get(entitlements, buildShowEntitlement(context, 'SAVE_PLAYLIST')),
);
