import artistRoutes from './artist';
import AuthRedirect from 'components/AuthRedirect';
import genreRoutes from './genre';
import liveRoutes from './live';
import miscRoutes from './misc';
import newsRoutes from './news';
import NotFoundView from 'components/Errors/404';
import playlistRoutes from './playlist';
import podcastRoutes from './podcasts';
import profileRoutes from './profile';
import recurlyRoutes from './recurly';
import redirectTo from 'router/Routes/helpers/redirectTo';
import WelcomeView from 'views/Welcome';
import WW_WHITELIST from 'router/Routes/constants/WwWhitelist';
import yourLibraryRoutes from './yourLibrary';

const AppRoutes = [
  {
    component: WelcomeView,
    exact: true,
    path: '/',
  },
  {
    component: AuthRedirect,
    exact: true,
    path: '/login',
  },
  ...newsRoutes,
  ...artistRoutes,
  ...liveRoutes,
  ...miscRoutes,
  ...profileRoutes,
  ...genreRoutes,
  ...podcastRoutes,
  ...playlistRoutes,
  ...yourLibraryRoutes,
  ...recurlyRoutes,
  // Always matches if non of the above match
  {
    component: NotFoundView,
    status: 404,
  },
];

export const WwRoutes = [
  ...AppRoutes.map(route =>
    WW_WHITELIST.includes(route.path) ? route : redirectTo(route, '/podcast/'),
  ),
];

export default AppRoutes;
