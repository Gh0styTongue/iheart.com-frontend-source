import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import { State as RootState, Selector } from 'state/types';
import { State } from './types';

export const getFeatures = createSelector<RootState, RootState, State>(
  state => state,
  state => get(state, 'features', {}) as State,
);

// This should be private and not exported, we want to ensure specific selectors are used outside
// of this file [DEM 11/04/2021]
const getFeatureFlags: Selector<State['flags']> = createSelector(
  getFeatures,
  features => get(features, 'flags'),
);

export const makeFeatureFlagSelector = <T>(
  key: Array<string> | string,
  def?: T,
) =>
  createSelector<RootState, State['flags'], T>(getFeatureFlags, flags =>
    get(flags, key, def),
  );

export const forceABTestSelector = makeFeatureFlagSelector<Record<string, any>>(
  'forceABTest',
  {},
);

export const getCustomRadioEnabled = makeFeatureFlagSelector<boolean>(
  'customRadio',
  true,
);

export const getDarkModeAvailable = makeFeatureFlagSelector<boolean>(
  'darkModeAvailable',
  false,
);

export const getExtrasNavEnabled: Selector<boolean> = makeFeatureFlagSelector(
  'extrasNav',
  false,
);

export const getForYouEnabled: Selector<boolean> = makeFeatureFlagSelector(
  'forYou',
  false,
);

export const getHeaderBidding: Selector<boolean> = makeFeatureFlagSelector(
  'headerBidding',
  false,
);

export const getHighlightsSDKEnabled: Selector<boolean> =
  makeFeatureFlagSelector('highlightsSDK', false);

export const getLongProfileIdEnabled: Selector<boolean> =
  makeFeatureFlagSelector('longProfileId', true);

// TODO: don't default to true when releasing
export const getNewSearchEnabled: Selector<boolean> =
  makeFeatureFlagSelector('newSearch');

export const getLiveRadioEnabled: Selector<boolean> = makeFeatureFlagSelector(
  'liveRadio',
  false,
);

export const getShowWelcome: Selector<boolean> = makeFeatureFlagSelector(
  'showWelcome',
  false,
);

export const showLiveLegalLinks: Selector<boolean> = makeFeatureFlagSelector(
  'liveLegalLinks',
  false,
);

export const getLiveRadioCountryNavEnabled: Selector<boolean> =
  makeFeatureFlagSelector('liveRadioCountryNav', false);

export const getPodcastPrerollsEnabled: Selector<boolean> =
  makeFeatureFlagSelector('podcastPreroll', false);

export const getResetPasswordIncludeLogin: Selector<boolean> =
  makeFeatureFlagSelector('resetPasswordIncludeLogin', false);

export const getOnDemandEnabled = makeFeatureFlagSelector<boolean>(
  'onDemand',
  false,
);

export const getPlaylistRadioAdsEnabled: Selector<boolean> =
  makeFeatureFlagSelector('playlistRadioAds', false);

export const getPivotGeoEnabled = (state: State): boolean =>
  get(state, ['features', 'flags', 'pivotGeoEnabled'], false);

export const getObfuscateUrls: Selector<boolean> = makeFeatureFlagSelector(
  'obfuscateUrls',
  false,
);

export const getPodcastRecsEnabled: Selector<boolean> = makeFeatureFlagSelector(
  'podcastRecs',
  false,
);

export const makeRegistrationSelector = <T>(
  key: string,
  def?: T,
): Selector<T> =>
  createSelector(getFeatures, features =>
    get(features, ['registration', key], def),
  );

export const getGenderAllowUnselected: Selector<boolean> =
  makeRegistrationSelector('genderAllowUnselected');

export const getGenders: Selector<Array<string>> = makeRegistrationSelector(
  'genders',
  [],
);

export const getOauths: Selector<Array<string>> =
  makeRegistrationSelector('oauths');

export const getUsePostal: Selector<boolean> = makeRegistrationSelector(
  'usePostal',
  false,
);

export const getZipRegex: Selector<string> =
  makeRegistrationSelector('zipRegex');

export const getEmailUpdatesDefaultUnchecked: Selector<boolean> =
  makeRegistrationSelector('emailUpdatesDefaultUnchecked', false);

export const getShowLoginInNav = (state: RootState): boolean =>
  state.features.registration?.showLoginInNav ?? true;

export const getZipNumeric: Selector<boolean> = createSelector(
  getFeatures,
  features => get(features, ['registration', 'zipKeyboard']) === 'numeric',
);

export const getHomepageNewsSection: Selector<boolean> =
  makeFeatureFlagSelector('homepageNewsSection', false);

export const getHomepageEventsSection: Selector<boolean> =
  makeFeatureFlagSelector('homepageEventsSection', false);

export const getFreeUserMyPlaylistEnabled: Selector<boolean> =
  makeFeatureFlagSelector('freeUserMyPlaylist', false);

export const getFreeUserPlaylistCreationEnabled = createSelector(
  getFeatureFlags,
  featureFlags => featureFlags?.freeUserPlaylistCreation ?? false,
);

export const getInternationalPlaylistRadioEnabled: Selector<boolean> =
  makeFeatureFlagSelector('internationalPlaylistRadio', false);

export const getTEMPnoRefreshOnLogin: Selector<boolean> =
  makeFeatureFlagSelector('TEMPnoRefreshOnLogin', false);

export const getpersonalizedPlaylistRecs: Selector<boolean> =
  makeFeatureFlagSelector('personalizedPlaylistRecs', false);

export const getRecommendedPlaylistRecs: Selector<boolean> =
  makeFeatureFlagSelector('recommendedPlaylistRecs', false);

export const getPodcastTranscriptionsEnabled: Selector<boolean> =
  makeFeatureFlagSelector('showPodcastTranscriptions', false);

export const getPodcastTritonTokenEnabled: Selector<boolean> =
  makeFeatureFlagSelector('podcastTritonTokenEnabled', false);

export const getUseAmpTranscription: Selector<boolean> =
  makeFeatureFlagSelector('useAmpTranscription', false);

export const getAllAccessPreviewEnabled: Selector<boolean> =
  makeFeatureFlagSelector('allAccessPreview', false);

export const getIsStationSpecificRegGateEnabled: Selector<boolean> =
  makeFeatureFlagSelector('stationSpecificRegGate', false);
