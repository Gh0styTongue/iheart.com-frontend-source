import getCurrentArticle from './getCurrentArticle';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';

const getIsBranded = createSelector(getCurrentArticle, article =>
  get(article, 'is_sponsored', false),
);

export default getIsBranded;
