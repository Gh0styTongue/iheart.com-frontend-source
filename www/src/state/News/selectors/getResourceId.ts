import getCurrentArticle from './getCurrentArticle';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';

const getResourceId = createSelector(getCurrentArticle, article =>
  get(article, 'resource_id'),
);

export default getResourceId;
