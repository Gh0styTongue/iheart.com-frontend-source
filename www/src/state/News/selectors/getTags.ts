import getCurrentArticle from './getCurrentArticle';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';

const getTags = createSelector(
  getCurrentArticle,
  article => get(article, 'tags', []) as [string],
);

export default getTags;
