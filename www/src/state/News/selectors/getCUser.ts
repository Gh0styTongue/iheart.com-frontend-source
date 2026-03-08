import getCurrentArticle from './getCurrentArticle';
import { Article } from '../types';
import { createSelector } from 'reselect';
import type { State } from 'state/types';

const getCUser = createSelector<
  State,
  Article | Record<string, any>,
  Article['cuser']
>(getCurrentArticle, article => article?.cuser ?? '');

export default getCUser;
