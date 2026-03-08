import AlexaLinkIOS from 'views/AlexaLinkIOS';
import Favorites from 'views/Favorites';
import ForYouView from 'views/ForYou';
import HomeView from 'views/Home';
import MetaWearablesLink from 'views/MetaWearablesLink';
import NotFoundView from 'components/Errors/404';
import paths from './paths';
import Refresh from 'views/Refresh';
import ServerErrorView from 'components/Errors/500';
import TesterOptionsView from 'views/TesterOptions';
import UserInfo from 'views/UserInfo';
import { getEnv } from 'state/Environment/selectors';
import { getMFRPath } from 'state/Favorites/selectors';
import { State } from 'state/types';

export default [
  {
    component: HomeView,
    exact: true,
    path: paths.misc.search,
  },
  {
    component: ForYouView,
    exact: true,
    path: paths.misc.forYou,
  },
  {
    component: ServerErrorView,
    exact: true,
    path: paths.misc.serverError,
  },
  {
    component: NotFoundView,
    exact: true,
    path: paths.misc.notFound,
  },
  {
    component: AlexaLinkIOS,
    exact: true,
    path: paths.misc.alexaLinkIOS,
  },
  {
    component: MetaWearablesLink,
    exact: true,
    path: paths.misc.metaWearablesLink,
  },
  {
    active: (state: State) =>
      ['dev', 'sandbox', 'master', 'prod', 'stage'].includes(getEnv(state)),
    component: TesterOptionsView,
    exact: true,
    path: paths.misc.testerOptions,
  },
  {
    component: UserInfo,
    exact: true,
    path: paths.misc.userInfo,
  },
  ...paths.misc.refresh.map(path => ({
    component: Refresh,
    exact: true,
    path,
  })),
  {
    component: Favorites,
    exact: true,
    path: paths.misc.favorites,
    pathCorrection: getMFRPath,
  },
];
