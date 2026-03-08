import getNews from './getNews';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import { State as RootState } from 'state/types';
import { State } from '../types';

const getIsRequestingArticle = createSelector<RootState, State, boolean>(
  getNews,
  news => get(news, ['status', 'requestingArticle'], false),
);

export default getIsRequestingArticle;
