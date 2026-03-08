import getCurrentArticle from './getCurrentArticle';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';

const getAmpEnabled = createSelector(getCurrentArticle, article =>
  get(article, 'amp_enabled', true),
);

export default getAmpEnabled;
