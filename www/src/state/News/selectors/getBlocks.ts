import getCurrentArticle from './getCurrentArticle';
import { Block } from 'state/News/types';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';

const getBlocks = createSelector(
  getCurrentArticle,
  article => get(article, 'blocks', []) as Array<Block>,
);

export default getBlocks;
