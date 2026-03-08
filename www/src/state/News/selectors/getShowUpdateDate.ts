import getCurrentArticle from './getCurrentArticle';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';

const getShowUpdateDate = createSelector(
  getCurrentArticle,
  article => get(article, 'show_updated_timestamp', 0) as number,
);

export default getShowUpdateDate;
