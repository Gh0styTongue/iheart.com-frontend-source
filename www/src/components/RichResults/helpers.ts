import {
  getArtistMarkup,
  getLiveMarkup,
  getNewsArticleMarkup,
  getPodcastEpisodeMarkup,
  getPodcastSeriesMarkup,
} from './markup';
import { ViewName } from 'views/PageBody';
import type { Params } from './types';

export const getMarkupByType = (params: Params) => {
  switch (params.type) {
    case ViewName.ArtistNews:
    case ViewName.ArtistProfile: {
      return getArtistMarkup(params.meta);
    }
    case ViewName.NewsContentArticle: {
      return getNewsArticleMarkup(params.meta);
    }
    case ViewName.LiveProfile: {
      return getLiveMarkup(params.meta);
    }
    case ViewName.PodcastEpisode: {
      return getPodcastEpisodeMarkup(params.meta);
    }
    case ViewName.PodcastProfile: {
      return getPodcastSeriesMarkup(params.meta);
    }
    default:
      return null;
  }
};
