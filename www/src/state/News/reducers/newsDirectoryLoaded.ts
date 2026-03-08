/* eslint-disable camelcase */

import { get, merge, uniqBy } from 'lodash-es';
import { State } from '../types';

export default function newsDirectoryLoaded(
  state: State,
  payload: {
    articles: Array<{
      payload: {
        canonical_url: string;
        external_url: string | null;
        feed_vendor: string | null;
        is_sponsored: boolean;
        show_updated_timestamp: boolean;
      };
      pub_changed: number;
      pub_start: number;
      slug: string;
      summary: {
        author: string;
        description: string;
        image: string;
        title: string;
      };
    }>;
    pageResumeParams: Record<string, unknown>; // pending changes from radio-edit
    siteSlug: string;
    topicData: {
      description: string;
      display_name: string;
    };
    topicSlug?: string;
  },
) {
  const {
    articles,
    siteSlug,
    topicSlug = 'root',
    pageResumeParams,
    topicData: { description, display_name: displayName },
  } = payload;
  const normalizedArticles = articles.map(
    ({ slug, payload: timelinePayload, summary, pub_changed, pub_start }) => ({
      pub_changed,
      pub_start,
      slug,
      ...summary,
      ...timelinePayload,
    }),
  );

  const pageLength = get(
    state,
    ['articleLists', siteSlug, topicSlug, 'pageLength'],
    normalizedArticles.length,
  );

  const oldArticles = get(
    state,
    ['articleLists', siteSlug, topicSlug, 'list'],
    [],
  );

  return merge({}, state, {
    articleLists: {
      [siteSlug]: {
        [topicSlug]: {
          description,
          displayName,
          lastRequestWasEmpty: !normalizedArticles.length,
          list: uniqBy([...oldArticles, ...normalizedArticles], 'slug'),
          pageLength,
          pageResumeParams,
        },
      },
    },
  });
}
