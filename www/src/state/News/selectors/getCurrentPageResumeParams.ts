import getNews from './getNews';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import { getSlug } from 'state/Routing/selectors';
import { NEWS_DIRECTORY_SLUG } from '../constants';
import { State as RootState } from 'state/types';
import { State } from 'state/News/types';

const getCurrentResumeParams = createSelector<
  RootState,
  State,
  string,
  {} | null
>(getNews, getSlug, (news, topicSlug) =>
  get(
    news,
    [
      'articleLists',
      NEWS_DIRECTORY_SLUG,
      topicSlug || 'root',
      'pageResumeParams',
    ],
    null,
  ),
);

export default getCurrentResumeParams;
