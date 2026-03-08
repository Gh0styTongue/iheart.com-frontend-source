import getBlocks from './getBlocks';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';

const getGalleryBlocks = createSelector(getBlocks, blocks =>
  blocks.filter(block => get(block, 'type') === 'gallery'),
);

export default getGalleryBlocks;
