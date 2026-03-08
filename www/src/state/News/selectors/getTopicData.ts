import getNews from './getNews';
import { createSelector } from 'reselect';
import { get, pick } from 'lodash-es';
import { getSlug } from 'state/Routing/selectors';
import { NEWS_DIRECTORY_SLUG } from '../constants';

const getTopicData = createSelector(
  getNews,
  getSlug,
  (news, topicSlug = 'root') =>
    pick(get(news, ['articleLists', NEWS_DIRECTORY_SLUG, topicSlug], {}), [
      'description',
      'displayName',
    ]) as { description: string; displayName: string },
);

export default getTopicData;
