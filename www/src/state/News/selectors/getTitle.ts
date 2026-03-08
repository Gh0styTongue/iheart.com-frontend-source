import getCurrentArticle from './getCurrentArticle';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';

const getTitle = createSelector(
  getCurrentArticle,
  article => get(article, 'title', '') as string,
);

export default getTitle;
