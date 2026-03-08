import loadable from '@loadable/component';
import withAnalytics from 'modules/Analytics/withAnalytics';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getAsyncData, pageInfo } from './statics';
import { getCountryCode } from 'state/Config/selectors';
import { getIsAuthenticated } from 'state/Session/selectors';
import {
  getCategories as getPodcastCategories,
  getPodcastCategoryId,
  getPodcastCategoryName,
  getPodcastsByCategoryId,
  getReceivedFollowed,
} from 'state/Podcast/selectors';
import { localize } from 'redux-i18n';
import { requestFollowed } from 'state/Podcast/actions';

const PodcastCategory = loadable(() => import('./PodcastCategory'));

PodcastCategory.getAsyncData = getAsyncData;
PodcastCategory.pageInfo = pageInfo;

export default compose(
  localize('translate'),
  connect(
    createStructuredSelector({
      categories: getPodcastCategories,
      categoryId: getPodcastCategoryId,
      categoryName: getPodcastCategoryName,
      categoryPodcasts: getPodcastsByCategoryId,
      countryCode: getCountryCode,
      isAuthenticated: getIsAuthenticated,
      receivedFollowed: getReceivedFollowed,
    }),
    { requestFollowed },
  ),
  withAnalytics(
    ({ categoryName }) => ({
      filterName: categoryName,
      filterType: 'Topics',
      pageName: 'podcast_sub_directory',
    }),
    {
      trackOnDidUpdate: (prevProps, nextProps) =>
        nextProps.categoryName !== prevProps.categoryName,
    },
  ),
)(PodcastCategory);
