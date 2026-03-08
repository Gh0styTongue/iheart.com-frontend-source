import getCurrentArticle from './getCurrentArticle';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';

const getSeoTitle = createSelector(getCurrentArticle, article =>
  get(article, 'seo_title'),
);

export default getSeoTitle;
