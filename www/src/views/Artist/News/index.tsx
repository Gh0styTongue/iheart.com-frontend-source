import loadable from '@loadable/component';
import withAnalytics from 'modules/Analytics/withAnalytics';
import { Article } from 'state/News/types';
import { connect } from 'react-redux';
import { createStructuredSelector, Selector } from 'reselect';
import { flowRight } from 'lodash-es';
import { getAsyncData, pageInfo } from './statics';
import { getContentLink } from 'state/Links/selectors';
import {
  getCurrentArtistArticles,
  getCurrentArtistId,
  getCurrentArtistName,
  getNewsPath,
} from 'state/Artists/selectors';
import { getSiteUrl } from 'state/Config/selectors';
import { Props } from './News';
import { State } from 'state/types';
import { ViewWithStatics } from 'views/ViewWithStatics';

const News = loadable(() => import('./News')) as ViewWithStatics;

News.pageInfo = pageInfo;
News.getAsyncData = getAsyncData;

export default flowRight(
  connect(
    createStructuredSelector<
      State,
      {
        articles: Array<Article>;
        contentLink: string;
        id: any;
        name: string;
        path: string;
        siteUrl: string;
      }
    >({
      articles: getCurrentArtistArticles as any as Selector<
        State,
        Array<Article>
      >,
      contentLink: getContentLink,
      id: getCurrentArtistId as any as Selector<State, any>,
      name: getCurrentArtistName as any as Selector<State, string>,
      path: getNewsPath as any as Selector<State, string>,
      siteUrl: getSiteUrl,
    }),
  ),
  withAnalytics(({ id, name }: Props) => ({
    id: `artist|${id}`,
    name,
    pageName: 'artist_news',
  })),
)(News);
