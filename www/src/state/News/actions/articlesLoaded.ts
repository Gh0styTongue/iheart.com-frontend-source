import { Article } from '../types';
import { ARTICLE_LOADED } from '../constants';
import { merge } from 'lodash-es';
import { StationTypeValue } from 'constants/stationTypes';

export default function articlesLoaded(
  articles: Array<Article>,
  resourceType?: StationTypeValue | 'genre',
  resourceId?: number | string,
) {
  return {
    payload: merge(
      {},
      {
        articles,
      },
      resourceType && resourceId ?
        {
          resource: {
            id: resourceId,
            type: resourceType,
          },
        }
      : {},
    ),
    type: ARTICLE_LOADED,
  };
}
