import getCurrentArticle from './getCurrentArticle';
import { createSelector } from 'reselect';

const hasCurrentArticle = createSelector(
  getCurrentArticle,
  article => !!article,
);

export default hasCurrentArticle;
