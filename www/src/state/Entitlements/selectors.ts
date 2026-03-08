import getUser from 'state/User/selectors';
import {
  AD_FREE,
  ADD_ALBUM_TO_PLAYLIST,
  ADD_TRACK_TO_PLAYLIST,
  ADFREE_CUSTOM,
  ALLACCESS_PREVIEW,
  ARTIST_2_START,
  CUSTOM_AD_UPSELL,
  EDIT_PLAYABLE_AS_RADIO,
  EDIT_PLAYLIST,
  MANAGE_USER_PLAYLIST,
  MORE_SKIPS,
  MORE_SKIPS_UPSELL,
  MYMUSIC_LIBRARY,
  PLAY_ALBUM,
  PLAY_PLAYLIST,
  PREROLL_FREE,
  REPLAY,
  SAVE_ALBUM_OVERFLOW,
  SAVE_TRACK_PLAYER,
  SAVE_TRACK_PLAYLIST,
  SCRUB_COLLECTION,
  SCRUB_CUSTOM,
  SCRUB_MYMUSIC,
  SHOW_ADD_TRACK_TO_PLAYLIST,
  SHOW_ALBUM_HEADER,
  SHOW_ALBUM_OVERFLOW,
  SHOW_ALBUM_UPSELL,
  SHOW_MYMUSIC_LIBRARY,
  SHOW_PLAYLIST_RADIO,
  SHOW_PLAYLIST_UPSELL,
  SHOW_REPLAY,
  SHOW_SAVE_ALBUM_HEADER_OVERFLOW,
  SHOW_SAVE_TRACK,
  SHOW_SAVE_TRACK_PLAYER,
  SHOW_TRACK_OVERFLOW,
  SHOW_UPGRADE_BUTTON,
  SHOW_UPSELL_SONG2START,
  SHUFFLE,
  SHUFFLE_CURATED,
  SONG_2_START,
  UNLIMITED_MYMUSIC_PLAYBACK,
} from './constants';
import { State as AdsState } from 'state/Ads/types';
import { createSelector } from 'reselect';
import { Entitlements, SubInfo } from './types';
import { get } from 'lodash-es';
import { getAds } from 'state/Ads/selectors';
import { getInternationalPlaylistRadioEnabled } from 'state/Features/selectors';
import { getTrialDurationString } from './helpers';
import { Selector } from 'state/types';
import { State, User } from 'state/buildInitialState';
import { SUBSCRIPTION_TYPE } from 'constants/subscriptionConstants';

type EntitlementSelector = Selector<boolean>;

export const getEntitlements = createSelector<State, User, Entitlements>(
  getUser,
  user => get(user, ['subscription', 'entitlements'], {}),
);

export function makeEntitlementsSelector(
  entitlement: string,
): EntitlementSelector {
  return createSelector(getEntitlements, (entitlements = {}) =>
    get(entitlements, entitlement, false),
  );
}

export const moreSkipsSelector: EntitlementSelector =
  makeEntitlementsSelector(MORE_SKIPS);

export const playPlaylistOnDemandSelector: EntitlementSelector = createSelector(
  getEntitlements,
  entitlements => entitlements?.[PLAY_PLAYLIST] || entitlements?.PLAY_PLAYLIST,
);

export const playPlaylistRadioSelector: EntitlementSelector = createSelector(
  getEntitlements,
  getInternationalPlaylistRadioEnabled,
  ({ PLAY_PLAYLIST_RADIO }, internationalPlaylistRadioEnabled) =>
    PLAY_PLAYLIST_RADIO || internationalPlaylistRadioEnabled,
);

export const showPlaylistRadioSelector: EntitlementSelector = createSelector(
  getEntitlements,
  entitlements => entitlements?.[SHOW_PLAYLIST_RADIO],
);

export const playPlaylistSelector: EntitlementSelector = createSelector(
  playPlaylistOnDemandSelector,
  playPlaylistRadioSelector,
  (od, radio) => od || radio,
);

export const playAlbumSelector: EntitlementSelector =
  makeEntitlementsSelector(PLAY_ALBUM);

export const showAlbumUpsellSelector: EntitlementSelector =
  makeEntitlementsSelector(SHOW_ALBUM_UPSELL);

export const artistToStartSelector: EntitlementSelector =
  makeEntitlementsSelector(ARTIST_2_START);

export const songToStartSelector: EntitlementSelector =
  makeEntitlementsSelector(SONG_2_START);

export const adFreeSelector = createSelector<
  State,
  Entitlements,
  AdsState,
  boolean
>(
  getEntitlements,
  getAds,
  (entitlements = {}, ads) =>
    get(entitlements, AD_FREE, false) || get(ads, ['suppressAds'], false),
);

export const replaySelector: EntitlementSelector =
  makeEntitlementsSelector(REPLAY);

const editPlaylistEntitlementSelector: EntitlementSelector =
  makeEntitlementsSelector(EDIT_PLAYLIST);

export const manageUserPlaylistEntitlementSelector: EntitlementSelector =
  makeEntitlementsSelector(MANAGE_USER_PLAYLIST);

export const editPlaylistSelector = createSelector<
  State,
  boolean,
  boolean,
  boolean
>(
  editPlaylistEntitlementSelector,
  manageUserPlaylistEntitlementSelector,
  (editPlaylist, manageUserPlaylist) => editPlaylist || manageUserPlaylist,
);

export const editPlayableAsRadioSelector: EntitlementSelector =
  makeEntitlementsSelector(EDIT_PLAYABLE_AS_RADIO);

export const addTrackToPlaylistSelector: EntitlementSelector =
  makeEntitlementsSelector(ADD_TRACK_TO_PLAYLIST);

export const saveTrackPlaylistSelector: EntitlementSelector = createSelector(
  getEntitlements,
  entitlements =>
    entitlements?.[SAVE_TRACK_PLAYLIST] ||
    entitlements?.SAVE_TRACK_OVERFLOW_PLAYLIST ||
    entitlements?.[MANAGE_USER_PLAYLIST],
);

export const shuffleSelector: EntitlementSelector =
  makeEntitlementsSelector(SHUFFLE);

export const shuffleCuratedSelector: EntitlementSelector =
  makeEntitlementsSelector(SHUFFLE_CURATED);

export const showPlaylistSelector: EntitlementSelector = playPlaylistSelector;

export const showMyMusicLibrarySelector: EntitlementSelector =
  makeEntitlementsSelector(SHOW_MYMUSIC_LIBRARY);

export const showUpgradeButtonSelector: EntitlementSelector =
  makeEntitlementsSelector(SHOW_UPGRADE_BUTTON);

export const showPlaylistUpsellSelector: EntitlementSelector =
  makeEntitlementsSelector(SHOW_PLAYLIST_UPSELL);

export const unlimitedMyMusicPlaybackSelector: EntitlementSelector =
  makeEntitlementsSelector(UNLIMITED_MYMUSIC_PLAYBACK);

export const showAlbumOverflowSelector: EntitlementSelector =
  makeEntitlementsSelector(SHOW_ALBUM_OVERFLOW);

export const addAlbumToPlaylistSelector: EntitlementSelector =
  makeEntitlementsSelector(ADD_ALBUM_TO_PLAYLIST);

export const saveAlbumOverflowSelector: EntitlementSelector =
  makeEntitlementsSelector(SAVE_ALBUM_OVERFLOW);

export const trackOverflowSelector: EntitlementSelector =
  makeEntitlementsSelector(SHOW_TRACK_OVERFLOW);

export const showAddTrackToPlaylistSelector: EntitlementSelector =
  makeEntitlementsSelector(SHOW_ADD_TRACK_TO_PLAYLIST);

export const showSaveTrackSelector: EntitlementSelector =
  makeEntitlementsSelector(SHOW_SAVE_TRACK);

export const showAlbumHeaderSelector: EntitlementSelector =
  makeEntitlementsSelector(SHOW_ALBUM_HEADER);

export const showSaveTrackPlayerSelector: EntitlementSelector =
  makeEntitlementsSelector(SHOW_SAVE_TRACK_PLAYER);

export const showReplaySelector: EntitlementSelector =
  makeEntitlementsSelector(SHOW_REPLAY);

export const scrubCollectionSelector: EntitlementSelector =
  makeEntitlementsSelector(SCRUB_COLLECTION);

export const scrubCustomSelector: EntitlementSelector =
  makeEntitlementsSelector(SCRUB_CUSTOM);

export const scrubMyMusicSelector: EntitlementSelector =
  makeEntitlementsSelector(SCRUB_MYMUSIC);

export const myMusicLibrarySelector: EntitlementSelector =
  makeEntitlementsSelector(MYMUSIC_LIBRARY);

export const noPrerollSelector: EntitlementSelector =
  makeEntitlementsSelector(PREROLL_FREE);

export const adsFreeCustomSelector: EntitlementSelector =
  makeEntitlementsSelector(ADFREE_CUSTOM);

export const customUpsellSelector: EntitlementSelector =
  makeEntitlementsSelector(CUSTOM_AD_UPSELL);

export const moreSkipsUpsellSelector: EntitlementSelector =
  makeEntitlementsSelector(MORE_SKIPS_UPSELL);

export const getAllAccessPreview: EntitlementSelector =
  makeEntitlementsSelector(ALLACCESS_PREVIEW);

export const saveTrackPlayerSelector: EntitlementSelector =
  makeEntitlementsSelector(SAVE_TRACK_PLAYER);

export const showUpsellSong2StartSelector: EntitlementSelector =
  makeEntitlementsSelector(SHOW_UPSELL_SONG2START);

export const showSaveAlbumHeaderOverflowSelector: EntitlementSelector =
  makeEntitlementsSelector(SHOW_SAVE_ALBUM_HEADER_OVERFLOW);

const getSubInfo = createSelector<State, User, SubInfo>(getUser, user =>
  get(user, ['subscription', 'subInfo'], {}),
);

export function makeSubInfoSelector<T>(key: string, fallback?: T): Selector<T> {
  return createSelector<State, SubInfo, T>(getSubInfo, subInfo =>
    get(subInfo, key, fallback),
  );
}

export const subInfoLoadedSelector: Selector<boolean> =
  makeSubInfoSelector('subInfoLoaded');

export const getSource: Selector<string> = makeSubInfoSelector(
  'source',
  'RECURLY',
);

export const getSubscriptionType = createSelector<
  State,
  SubInfo,
  keyof typeof SUBSCRIPTION_TYPE
>([getSubInfo], subInfo =>
  get(
    subInfo,
    'subscriptionType',
    SUBSCRIPTION_TYPE.NONE as keyof typeof SUBSCRIPTION_TYPE,
  ),
);

export const getIsTrial = createSelector<State, SubInfo, boolean>(
  getSubInfo,
  subInfo => get(subInfo, 'isTrial', false),
);

export const getTrialMonths = createSelector<State, SubInfo, string>(
  getSubInfo,
  subInfo => get(subInfo, 'trialMonths', ''),
);

export const getIsFamilyPlanParent = createSelector<State, SubInfo, boolean>(
  [getSubInfo],
  subInfo => get(subInfo, 'isFamilyPlanParent', false),
);

export const getIsFamilyPlanChild: Selector<boolean> = createSelector<
  State,
  SubInfo,
  boolean
>([getSubInfo], subInfo => get(subInfo, 'isFamilyPlanChild', false));

export const getIsUserPremium = createSelector<
  State,
  SubInfo['subscriptionType'],
  boolean,
  boolean
>(
  getSubscriptionType,
  getAllAccessPreview,
  (subscriptionType, isAllAccess) =>
    subscriptionType === SUBSCRIPTION_TYPE.PREMIUM || isAllAccess,
);

export const getLongFormSubscriptionType = createSelector<
  State,
  keyof typeof SUBSCRIPTION_TYPE,
  boolean,
  string,
  string
>(
  getSubscriptionType,
  getIsTrial,
  getTrialMonths,
  (subscriptionType, isTrial, trialMonths) =>
    ({
      [SUBSCRIPTION_TYPE.NONE]: 'None',
      [SUBSCRIPTION_TYPE.FREE]: 'Free',
      [SUBSCRIPTION_TYPE.PLUS]:
        isTrial ?
          `Plus - ${getTrialDurationString(trialMonths)} Free Trial`
        : 'Plus - Paid',
      [SUBSCRIPTION_TYPE.PREMIUM]:
        isTrial ?
          `All Access - ${getTrialDurationString(trialMonths)} Free Trial`
        : 'All Access - Paid',
    })[subscriptionType],
);

export const getIsTrialEligible: Selector<boolean> = makeSubInfoSelector(
  'isTrialEligible',
  false,
);

export const getHasBillingHistory: Selector<boolean> = makeSubInfoSelector(
  'hasBillingHistory',
  false,
);

export const getExpiration: Selector<string | null | undefined> =
  makeSubInfoSelector('expiration', null);

export const getAutoRenewing: Selector<boolean> = makeSubInfoSelector(
  'isAutoRenewing',
  false,
);

export const getIsNoneUser: Selector<boolean> = createSelector(
  getSubscriptionType,
  type => type === SUBSCRIPTION_TYPE.NONE,
);

export const getIsFreeUser: Selector<boolean> = createSelector(
  getSubscriptionType,
  type => type === SUBSCRIPTION_TYPE.FREE,
);

export const getIsPlusUser: Selector<boolean> = createSelector(
  getSubscriptionType,
  type => type === SUBSCRIPTION_TYPE.PLUS,
);

export const getIsPremiumUser: Selector<boolean> = createSelector(
  getSubscriptionType,
  type => type === SUBSCRIPTION_TYPE.PREMIUM,
);
