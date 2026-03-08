import loadable from '@loadable/component';
import {
  adFreeSelector,
  getAllAccessPreview,
  getSubscriptionType,
  showPlaylistSelector,
  showUpgradeButtonSelector,
  subInfoLoadedSelector,
} from 'state/Entitlements/selectors';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import {
  getAppMounted,
  getIsListenInAppVisible,
  getIsSearchOpen,
  isShowingSideNav,
} from 'state/UI/selectors';
import {
  getContestsLink,
  getCustomRadioLink,
  getEventsLink,
  getFeaturesLink,
  getForYouLink,
  getGenresLink,
  getLiveRadioLink,
  getMyMusicLink,
  getMyStationsLink,
  getNewsLink,
  getPhotosLink,
  getPlaylistsLink,
  getPodcastsLink,
  getUpgradeLink,
  getYourLibraryLink,
} from 'state/Links/selectors';
import { getCurrentPath } from 'state/Routing/selectors';
import {
  getCustomRadioEnabled,
  getDarkModeAvailable,
  getInternationalPlaylistRadioEnabled,
  getShowLoginInNav,
} from 'state/Features/selectors';

import { getIsLoggedOut } from 'state/Session/selectors';
import {
  getPreferences,
  getTruncatedUsernameSelector,
} from 'state/Profile/selectors';
import { hasHero, hideHero } from 'state/Hero/selectors';
import { hideSideNav, showSideNav } from 'state/UI/actions';
import { logoutAndStartAnonymousSession } from 'state/Session/actions';

const Header = loadable(() => import('./Header'));

export default connect(
  createStructuredSelector({
    adFree: adFreeSelector,
    allAccessPreview: getAllAccessPreview,
    appMounted: getAppMounted,
    customRadioEnabled: getCustomRadioEnabled,
    darkModeAvailable: getDarkModeAvailable,
    displayName: getTruncatedUsernameSelector(16),
    hasHero,
    hasUpgrade: showUpgradeButtonSelector,
    hideHero,
    internationalPlaylistRadioEnabled: getInternationalPlaylistRadioEnabled,
    isLoggedOut: getIsLoggedOut,
    isSearchOpen: getIsSearchOpen,
    listenInAppVisible: getIsListenInAppVisible,
    navLinks: createStructuredSelector({
      contest: getContestsLink,
      custom: getCustomRadioLink,
      events: getEventsLink,
      features: getFeaturesLink,
      forYou: getForYouLink,
      genre: getGenresLink,
      live: getLiveRadioLink,
      myMusic: getMyMusicLink,
      myStations: getMyStationsLink,
      news: getNewsLink,
      photo: getPhotosLink,
      playlist: getPlaylistsLink,
      podcast: getPodcastsLink,
      upgradeUrl: getUpgradeLink,
      yourLibrary: getYourLibraryLink,
    }),
    path: getCurrentPath,
    preferences: getPreferences,
    showingSideNav: isShowingSideNav,
    showLoginInNav: getShowLoginInNav,
    showPlaylists: showPlaylistSelector,
    subInfoLoaded: subInfoLoadedSelector,
    subscriptionType: getSubscriptionType,
  }),
  {
    hideSideNav,
    logoutAndStartAnonymousSession,
    showSideNav,
  },
)(Header);
