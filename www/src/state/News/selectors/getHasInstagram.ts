import getCurrentArticle from './getCurrentArticle';
import { Block } from 'state/News/types';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';

// WEB-8428 Instagram has a single script that needs to be loaded for all embeds,
// so it's got a special selector to determine if that script needs to be provided
const getHasInstagram = createSelector(getCurrentArticle, article =>
  get(article, 'blocks', []).some(
    (block: Block & { provider: 'Instagram' }) =>
      block.provider === 'Instagram',
  ),
);

export default getHasInstagram;
