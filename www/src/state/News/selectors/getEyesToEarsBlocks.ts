import getBlocks from './getBlocks';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';

const getEyesToEarsBlocks = createSelector(getBlocks, blocks =>
  blocks.filter(block => get(block, 'type') === 'catalog'),
);

export default getEyesToEarsBlocks;
