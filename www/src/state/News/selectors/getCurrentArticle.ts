import getContent from './getContent';
import getIsRequestingArticle from './getIsRequestingArticle';
import { Article } from '../types';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import { getSlug } from 'state/Routing/selectors';
import { State as RootState } from 'state/types';

const getCurrentArticle = createSelector<
  RootState,
  Record<string, Article>,
  string,
  boolean,
  Article | {}
>(
  getContent,
  getSlug,
  getIsRequestingArticle,
  (articles, slug, isRequesting) =>
    isRequesting ? {} : get(articles, slug, articles['404']),
);

export default getCurrentArticle;
