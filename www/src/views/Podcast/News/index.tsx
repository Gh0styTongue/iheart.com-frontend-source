import loadable from '@loadable/component';
import withAnalytics from 'modules/Analytics/withAnalytics';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { flowRight } from 'lodash-es';
import { getAsyncData, pageInfo } from './statics';
import { getContentLink } from 'state/Links/selectors';
import {
  getCurrentPodcastArticles,
  getPodcastNewsPath,
  getSeedId,
  getSlug,
  getTitle,
  PodcastArticles,
} from 'state/Podcast/selectors';
import { getSiteUrl } from 'state/Config/selectors';
import type { State as RootState } from 'state/types';
import type { ViewWithStatics } from 'views/ViewWithStatics';

const News = loadable(() => import('./News')) as ViewWithStatics;

News.getAsyncData = getAsyncData;
News.pageInfo = pageInfo;

const selectorOptions = {
  articles: getCurrentPodcastArticles,
  contentLink: getContentLink,
  id: getSeedId,
  name: getTitle,
  path: getPodcastNewsPath,
  siteUrl: getSiteUrl,
  slug: getSlug,
};

type StructuredData = {
  articles: PodcastArticles;
  contentLink: string;
  id: number;
  name: string;
  path: string;
  siteUrl: string;
  slug: string;
};

export default flowRight(
  connect(createStructuredSelector<RootState, StructuredData>(selectorOptions)),
  withAnalytics(({ id, name }: { id: string; name: string }) => ({
    id: `podcast|${id}`,
    name,
    pageName: 'podcast_news',
  })),
)(News);
