import newsRoutes from '../news';
import paths from '../paths';
import podcastRoutes from '../podcasts';

// These are the only paths that WW users should be able to visit
const WW_WHITELIST = [
  paths.yourLibrary.index,
  paths.yourLibrary.podcasts,
  paths.yourLibrary.recentlyPlayed,
  paths.misc.search,
  paths.misc.serverError,
  paths.misc.notFound,
  paths.misc.userInfo,
  paths.misc.testerOptions,
  ...paths.misc.refresh,
  ...newsRoutes.map(({ path }) => path),
  ...podcastRoutes.map(({ path }) => path),
] as const;

export default WW_WHITELIST;
