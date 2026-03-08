import getCurrentArticle from './getCurrentArticle';
import { Article } from '../types';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import { State } from 'state/types';

const getAuthor = createSelector<State, Article | {}, string>(
  getCurrentArticle,
  article => get(article, 'author', ''),
);

export default getAuthor;
