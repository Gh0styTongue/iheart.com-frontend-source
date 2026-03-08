import loadable from '@loadable/component';
import withAnalytics from 'modules/Analytics/withAnalytics';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { flowRight } from 'lodash-es';
import {
  getArticleList,
  getCurrentListHasMoreArticles,
  getCurrentPageResumeParams,
  getTopicData,
} from 'state/News/selectors';
import { getAsyncData } from './statics';
import { getSlug } from 'state/Routing/selectors';
import { loadNewsArticles } from 'state/News/actions';
import { Props } from './TopicDirectory';
import { State } from 'state/types';
import { ViewWithStatics } from 'views/ViewWithStatics';

const TopicDirectory = loadable(
  () => import('./TopicDirectory'),
) as ViewWithStatics;

TopicDirectory.getAsyncData = getAsyncData;

export default flowRight(
  connect(
    createStructuredSelector<
      State,
      Pick<
        Props,
        | 'articles'
        | 'hasMoreArticles'
        | 'pageResumeParams'
        | 'topicData'
        | 'topicSlug'
      >
    >({
      articles: getArticleList,
      hasMoreArticles: getCurrentListHasMoreArticles,
      pageResumeParams: getCurrentPageResumeParams,
      topicData: getTopicData,
      topicSlug: getSlug,
    }),
    { loadNewsArticles },
  ),
  withAnalytics(({ topicSlug }: Props) => ({
    contentFrame: 'page',
    filterName: topicSlug,
    filterType: 'content_topic',
    pageName: 'topic',
  })),
)(TopicDirectory);
