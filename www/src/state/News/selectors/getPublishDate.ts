import getCurrentArticle from './getCurrentArticle';
import { Article } from 'state/News/types';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import { State as RootState } from 'state/types';

const getPublishDate = createSelector<RootState, {} | Article, number>(
  getCurrentArticle,
  article => get(article, 'publish_date', 0),
);

export default getPublishDate;
