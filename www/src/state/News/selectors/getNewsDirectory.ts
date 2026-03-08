import getNews from './getNews';
import { ArticleMeta, State } from '../types';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import { NEWS_DIRECTORY_SLUG } from '../constants';
import { State as RootState } from 'state/types';

const getNewsDirectory = createSelector<RootState, State, Array<ArticleMeta>>(
  getNews,
  news =>
    get(
      news,
      ['articleLists', NEWS_DIRECTORY_SLUG, 'root', 'list'],
      [],
    ) as Array<ArticleMeta>,
);

export default getNewsDirectory;
