import getCurrentPageResumeParams from './getCurrentPageResumeParams';
import getNews from './getNews';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import { getSlug } from 'state/Routing/selectors';
import { NEWS_DIRECTORY_SLUG } from '../constants';
import { State as RootState } from 'state/types';
import { State } from 'state/News/types';

const getCurrentListHasMoreArticles = createSelector<
  RootState,
  State,
  string,
  {} | null,
  boolean
>(
  getNews,
  getSlug,
  getCurrentPageResumeParams,
  (news, topicSlug, pageResumeParams) => {
    const lastRequestWasEmpty = get(
      news,
      [
        'articleLists',
        NEWS_DIRECTORY_SLUG,
        topicSlug || 'root',
        'lastRequestWasEmpty',
      ],
      false,
    );

    return !lastRequestWasEmpty && !!pageResumeParams;
  },
);

export default getCurrentListHasMoreArticles;
