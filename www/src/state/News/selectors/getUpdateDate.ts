import getCurrentArticle from './getCurrentArticle';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';

const getUpdateDate = createSelector(
  getCurrentArticle,
  article => get(article, 'update_date', 0) as number,
);

export default getUpdateDate;
