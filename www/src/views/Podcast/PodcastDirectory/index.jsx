import loadable from '@loadable/component';
import withAnalytics from 'modules/Analytics/withAnalytics';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import {
  getAllFollowed,
  getFeaturedCategory,
  getFeaturedCategoryPodcasts,
  getCategories as getPodcastCategories,
  getPopularCategory,
  getPopularCategoryPodcasts,
  getReceivedFollowed,
} from 'state/Podcast/selectors';
import { getAsyncData, pageInfo } from './statics';
// State
import { getCountryCode } from 'state/Config/selectors';
import {
  getIsAuthenticated,
  getProfileId,
  getSessionId,
} from 'state/Session/selectors';
import { getPath } from 'state/Routing/selectors';
import {
  getPodcastCategories as getPodcastCategoriesAction,
  getPodcastRecs,
  requestFollowed,
} from 'state/Podcast/actions';
import { getPodcastRecsEnabled } from 'state/Features/selectors';
import { getPodcastRecs as getUserPodcastRecs } from 'state/Recs/selectors';
import { localize } from 'redux-i18n';
import { setHasHero } from 'state/Hero/actions';

const PodcastDirectory = loadable(() => import('./PodcastDirectory'));

PodcastDirectory.getAsyncData = getAsyncData;
PodcastDirectory.pageInfo = pageInfo;

export default compose(
  localize('translate'),
  connect(
    createStructuredSelector({
      categories: getPodcastCategories,
      countryCode: getCountryCode,
      featuredCategory: getFeaturedCategory,
      featuredCategoryPodcasts: getFeaturedCategoryPodcasts,
      followed: getAllFollowed,
      isAuthenticated: getIsAuthenticated,
      pathName: getPath,
      podcastRecsFlag: getPodcastRecsEnabled,
      popularCategory: getPopularCategory,
      popularCategoryPodcasts: getPopularCategoryPodcasts,
      profileId: getProfileId,
      receivedFollowed: getReceivedFollowed,
      recs: getUserPodcastRecs,
      sessionId: getSessionId,
    }),
    {
      getPodcastCategories: getPodcastCategoriesAction,
      getPodcastRecs,
      requestFollowed,
      setHasHero,
    },
  ),
  withAnalytics({ pageName: 'podcast_directory' }),
)(PodcastDirectory);
