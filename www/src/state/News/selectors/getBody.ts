import getBlocks from './getBlocks';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';

const getBody = createSelector(getBlocks, blocks =>
  blocks.map(block => ({
    ...block,
    attributes: {
      ...(block as any).attributes,
      html: decodeURI(get(block, ['attributes', 'html'], '')),
    },
    html: decodeURI(get(block, 'html', '')),
  })),
);

export default getBody;
