import getNews from './getNews';
import { Article, State } from '../types';
import { createSelector } from 'reselect';
import { State as RootState } from 'state/types';

const getContent = createSelector<RootState, State, Record<string, Article>>(
  getNews,
  news => news.articles,
);

export default getContent;
