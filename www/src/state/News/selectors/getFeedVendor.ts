import getCurrentArticle from './getCurrentArticle';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';

const getFeedVendor = createSelector(getCurrentArticle, article =>
  get(article, 'feed_vendor'),
);

export default getFeedVendor;
