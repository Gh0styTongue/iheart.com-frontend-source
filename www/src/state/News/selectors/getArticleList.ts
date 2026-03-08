import getNews from './getNews';
import { ArticleMeta, State } from 'state/News/types';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import { getSlug } from 'state/Routing/selectors';
import { NEWS_DIRECTORY_SLUG } from '../constants';
import { State as RootState } from 'state/types';

const getArticleList = createSelector<
  RootState,
  State,
  string,
  Array<ArticleMeta>
>(
  getNews,
  getSlug,
  (news, topicSlug = 'root') =>
    get(
      news,
      ['articleLists', NEWS_DIRECTORY_SLUG, topicSlug, 'list'],
      [],
    ) as Array<ArticleMeta>,
);

export default getArticleList;
