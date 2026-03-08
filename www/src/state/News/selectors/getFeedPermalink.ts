import getCurrentArticle from './getCurrentArticle';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';

const getFeedPermalink = createSelector(getCurrentArticle, article =>
  get(article, 'feed_permalink'),
);

export default getFeedPermalink;
