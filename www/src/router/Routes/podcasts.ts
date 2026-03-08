import NetworkDirectory from 'views/Podcast/NetworkDirectory';
import paths from './paths';
import PodcastCategory from 'views/Podcast/PodcastCategory';
import PodcastDirectory from 'views/Podcast/PodcastDirectory';
import PodcastNews from 'views/Podcast/News';
import PodcastProfileView from 'views/Podcast/PodcastProfile';
import url from 'url';
import {
  getPodcastDirectoryPath,
  getPodcastEpisodePath,
  getPodcastNewsPath,
  getPodcastPath,
} from 'state/Podcast/selectors';
import type { UrlWithParsedQuery } from 'url';

export default [
  {
    component: NetworkDirectory,
    exact: true,
    path: paths.podcast.networks,
    pathCorrection: getPodcastDirectoryPath,
  },
  {
    component: PodcastDirectory,
    exact: true,
    path: paths.podcast.directory,
  },
  {
    component: PodcastCategory,
    exact: true,
    path: paths.podcast.category,
    pathCorrection: getPodcastDirectoryPath,
  },
  {
    component: PodcastProfileView,
    exact: true,
    path: paths.podcast.highlights,
  },
  {
    component: PodcastProfileView,
    exact: true,
    path: paths.podcast.profile,
    pathCorrection: getPodcastPath,
  },
  {
    component: PodcastNews,
    exact: true,
    path: paths.podcast.news,
    pathCorrection: getPodcastNewsPath,
  },
  {
    component: PodcastProfileView,
    exact: true,
    path: paths.podcast.episodes,
  },
  {
    exact: true,
    path: paths.podcast.show,
    redirect({ pathname, query }: UrlWithParsedQuery) {
      const newPathname = pathname?.replace('show', 'podcast') as string;
      return query.episode_id ?
          `${newPathname}episode/${query.episode_id}/`
        : newPathname;
    },
    status: 301,
  },
  {
    addQuery: { embed: true },
    path: paths.podcast.widget,
    redirect({ pathname, query }: UrlWithParsedQuery) {
      const { showId, episodeId } = query;
      const newPathname = url.resolve(
        pathname?.replace('widget', 'podcast') as string,
        showId as string,
      );
      return episodeId ?
          url.resolve(`${newPathname}/episode/`, episodeId as string)
        : newPathname;
    },
    status: 301,
  },
  {
    component: PodcastProfileView,
    exact: true,
    path: paths.podcast.episode,
    pathCorrection: getPodcastEpisodePath,
  },
];
