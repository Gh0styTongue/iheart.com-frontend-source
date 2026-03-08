import { PodcastEpisodeMarkup, PodcastSeriesMarkup } from '../types';

export const getPodcastSeriesMarkup = (meta: PodcastSeriesMarkup) => {
  const { hosts, description, image, name, url, webFeed } =
    meta as PodcastSeriesMarkup;
  return {
    '@context': 'https://schema.org/',
    '@type': 'PodcastSeries',
    name,
    description,
    image,
    url,
    webFeed,
    author:
      hosts && hosts.length > 0 ?
        hosts.map(host => ({
          '@type': 'Person',
          name: host.title,
          image: host.image,
          url: host.link,
          description: host.description,
        }))
      : undefined,
  };
};

export const getPodcastEpisodeMarkup = (meta: PodcastEpisodeMarkup) => {
  const {
    name,
    url,
    description,
    image,
    associatedMedia,
    duration,
    partOfSeries,
  } = meta as PodcastEpisodeMarkup;
  return {
    '@context': 'https://schema.org/',
    '@type': 'PodcastEpisode',
    associatedMedia,
    description,
    duration,
    image,
    name,
    url,
    partOfSeries: getPodcastSeriesMarkup(partOfSeries),
  };
};
