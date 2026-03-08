import loadable from '@loadable/component';
import withAnalytics from 'modules/Analytics/withAnalytics';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import {
  getAdKeywords,
  getAdTopics,
  getAmpEnabled,
  getAuthor,
  getCurrentArticle,
  getExternalUrl,
  getFeedVendor,
  getHasInstagram,
  getHasTwitter,
  getIsBranded,
  getKeywords,
  getPublishDate,
  getTags,
} from 'state/News/selectors';
import { getAsyncData, pageInfo } from './statics';
import { getBlockedPIIBehaviors } from 'state/Profile/selectors';
import { getContentAnalyticsData } from './helpers';
import { getIsInApp } from 'state/Environment/selectors';
import { getSiteUrl } from 'state/Config/selectors';
import { getSlug } from 'state/Routing/selectors';
import { setHasHero } from 'state/Hero/actions';
import { subInfoLoadedSelector } from 'state/Entitlements/selectors';

const ContentArticle = loadable(() => import('./ContentArticle'));

ContentArticle.getAsyncData = getAsyncData;
ContentArticle.pageInfo = pageInfo;

export default compose(
  connect(
    createStructuredSelector({
      adKeywords: getAdKeywords,
      adTopics: getAdTopics,
      ampEnabled: getAmpEnabled,
      article: getCurrentArticle,
      author: getAuthor,
      blockedPIIBehaviors: getBlockedPIIBehaviors,
      externalUrl: getExternalUrl,
      feedVendor: getFeedVendor,
      hasInstagram: getHasInstagram,
      hasTwitter: getHasTwitter,
      isBranded: getIsBranded,
      isInApp: getIsInApp,
      keywords: getKeywords,
      publishDate: getPublishDate,
      siteUrl: getSiteUrl,
      slug: getSlug,
      subInfoLoaded: subInfoLoadedSelector,
      tags: getTags,
    }),
    { setHasHero },
  ),
  withAnalytics(getContentAnalyticsData, {
    trackOnWillMount: ({ article }) =>
      article?.cuser?.length || article?.feedVendor?.length,
    trackOnDidUpdate: (prevProps, props) => {
      return (
        (prevProps?.article?.cuser !== props?.article?.cuser &&
          props?.article?.cuser?.length) ||
        (prevProps?.article?.feedVendor !== props?.article?.feedVendor &&
          props?.article?.feedVendor?.length)
      );
    },
  }),
)(ContentArticle);
