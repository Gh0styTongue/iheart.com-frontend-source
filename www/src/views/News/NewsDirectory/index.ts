import loadable from '@loadable/component';
import withAnalytics from 'modules/Analytics/withAnalytics';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { flow } from 'lodash-es';
import { getAsyncData } from './statics';
import {
  getCurrentListHasMoreArticles,
  getCurrentPageResumeParams,
  getNewsDirectory,
} from 'state/News/selectors';
import { loadNewsArticles } from 'state/News/actions';
import { Props } from './NewsDirectory';
import { State } from 'state/types';
import { ViewWithStatics } from 'views/ViewWithStatics';

const NewsDirectory = loadable(
  () => import('./NewsDirectory'),
) as ViewWithStatics;

NewsDirectory.getAsyncData = getAsyncData;

export default flow(
  connect(
    createStructuredSelector<
      State,
      Pick<Props, 'articles' | 'hasMoreArticles' | 'pageResumeParams'>
    >({
      articles: getNewsDirectory,
      hasMoreArticles: getCurrentListHasMoreArticles,
      pageResumeParams: getCurrentPageResumeParams,
    }),
    { loadNewsArticles },
  ),
  withAnalytics({ pageName: 'news' }),
)(NewsDirectory);
