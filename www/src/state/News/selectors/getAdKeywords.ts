import getCurrentArticle from './getCurrentArticle';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';

const getAdKeywords = createSelector(getCurrentArticle, article =>
  get(article, 'adKeywords', ''),
);

export default getAdKeywords;
