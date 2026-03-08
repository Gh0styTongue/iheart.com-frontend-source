import getCurrentArticle from './getCurrentArticle';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';

const getAdTopics = createSelector(getCurrentArticle, article =>
  get(article, 'adTopics', ''),
);

export default getAdTopics;
