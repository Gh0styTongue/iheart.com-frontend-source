import getCurrentArticle from './getCurrentArticle';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';

const getExternalUrl = createSelector(getCurrentArticle, article =>
  get(article, 'external_url'),
);

export default getExternalUrl;
