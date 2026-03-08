import getCurrentArticle from './getCurrentArticle';
import { Article } from '../types';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import { State as RootState } from 'state/types';

const getKeywords = createSelector<RootState, {} | Article, Array<string>>(
  getCurrentArticle,
  article => get(article, 'keywords', []) as Array<string>,
);

export default getKeywords;
