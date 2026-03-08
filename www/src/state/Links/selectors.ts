import { createSelector, Selector } from 'reselect';
import { getCountryCode } from 'state/Config/selectors';
import { getLang } from 'state/i18n/selectors';
import type { State as RootState } from 'state/types';
import type { State } from './types';

type LinkSelector = Selector<RootState, string>;

export const getLinks = (state: RootState): State => state?.links ?? {};

export const makeLinkSelector = (
  key: keyof State,
  def?: string,
): LinkSelector => createSelector(getLinks, links => links?.[key] ?? def ?? '');

export const getAboutLink: LinkSelector = makeLinkSelector('about');
export const getAdChoicesLink: LinkSelector = makeLinkSelector('adChoices');
export const getAdvertiseLink: LinkSelector = makeLinkSelector('advertise');
export const getAppsAutoLink: LinkSelector = makeLinkSelector('appsAuto');
export const getAppsHomeLink: LinkSelector = makeLinkSelector('appsHome');
export const getAppsLink: LinkSelector = makeLinkSelector('apps');
export const getAppsMobileLink: LinkSelector = makeLinkSelector('appsMobile');
export const getAppsWearLink: LinkSelector = makeLinkSelector('appsWear');
export const getBlogLink: LinkSelector = makeLinkSelector('blog');
export const getBrandLink: LinkSelector = makeLinkSelector('brand');
export const getContentLink: LinkSelector = makeLinkSelector('content');
export const getContestRulesLink: LinkSelector =
  makeLinkSelector('contestRules');
export const getContestsLink = createSelector(
  getLinks,
  getLang,
  getCountryCode,
  (links, lang, countryCode) =>
    lang === 'fr' && countryCode === 'CA' ?
      'https://www.iheartradio.ca/fr/concours.html'
    : links?.contests,
);
export const getCustomRadioLink: LinkSelector = makeLinkSelector('customRadio');
export const getEventsLink = createSelector(
  getLinks,
  getLang,
  getCountryCode,
  (links, lang, countryCode) =>
    lang === 'fr' && countryCode === 'CA' ?
      'https://www.iheartradio.ca/fr.html'
    : links?.events,
);
export const getFeaturesLink = createSelector(
  getLinks,
  getLang,
  getCountryCode,
  (links, lang, countryCode) =>
    lang === 'fr' && countryCode === 'CA' ?
      'https://www.iheartradio.ca/fr/iheartradio-future-star.html'
    : links?.features,
);

export const getForYouLink: LinkSelector = makeLinkSelector('forYou');
export const getGenresLink: LinkSelector = makeLinkSelector('genres');
export const getHelpLink: LinkSelector = makeLinkSelector('help');
export const getHelpResettingPasswordLink: LinkSelector = makeLinkSelector(
  'helpResettingPassword',
);
export const getHelpSkipLimitLink: LinkSelector =
  makeLinkSelector('helpSkipLimit');
export const getHelpSocialSignInLink: LinkSelector =
  makeLinkSelector('helpSocialSignIn');
export const getHomeLink: LinkSelector = makeLinkSelector('home');
export const getJobsLink: LinkSelector = makeLinkSelector('jobs');
export const getLiveRadioLink: LinkSelector = makeLinkSelector('liveRadio');
export const getMyMusicLink: LinkSelector = makeLinkSelector('myMusic');
export const getMyStationsLink: LinkSelector = makeLinkSelector('myStations');
export const getNewsLink = createSelector(
  getLinks,
  getLang,
  getCountryCode,
  (links, lang, countryCode) =>
    lang === 'fr' && countryCode === 'CA' ?
      'https://www.iheartradio.ca/fr/nouvelles-musicales.html'
    : links?.news,
);
export const getOnDemandLink: LinkSelector = makeLinkSelector('ondemand');
export const getPerfectForLink: LinkSelector = makeLinkSelector('perfectFor');
export const getPhotosLink: LinkSelector = makeLinkSelector('photos');
export const getPlaylistsLink: LinkSelector = makeLinkSelector('playlists');
export const getPodcastsLink: LinkSelector = makeLinkSelector('podcasts');
export const getPrivacyLink: LinkSelector = makeLinkSelector('privacy');
export const getSubscriptionOptionsLink: LinkSelector = makeLinkSelector(
  'subscriptionoptions',
);
export const getTermsLink: LinkSelector = makeLinkSelector('terms');
export const getTlnkAppsLink: LinkSelector = makeLinkSelector('tlnkApps');
export const getTheAppLink: LinkSelector = makeLinkSelector('getTheAppLink');
export const getUpgradeLink: LinkSelector = makeLinkSelector('upgrade');
export const getYourLibraryLink: LinkSelector = makeLinkSelector('yourLibrary');
