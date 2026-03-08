import getCurrentArticle from './getCurrentArticle';
import { Block } from 'state/News/types';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';

// WEB-9233 Twitter loads its script once globally, so it needs to refire when it gets embeds
const getHasTwitter = createSelector(getCurrentArticle, article =>
  get(article, 'blocks', []).some(
    (block: Block & { provider: 'Twitter' }) => block.provider === 'Twitter',
  ),
);

export default getHasTwitter;
