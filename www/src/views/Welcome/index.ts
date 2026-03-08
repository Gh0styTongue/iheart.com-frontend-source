import loadable from '@loadable/component';
import withAnalytics from 'modules/Analytics/withAnalytics';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { fetchGenrePreferences } from 'state/Genres/actions';
import { flowRight } from 'lodash-es';
import { getAsyncData, pageInfo } from './statics';
import { getCountryCode } from 'state/Config/selectors';
import {
  getCustomRadioEnabled,
  getShowWelcome,
} from 'state/Features/selectors';
import { getIsAnonymous } from 'state/Session/selectors';
import { getQueryParams, getSearch } from 'state/Routing/selectors';
import { getSelectedGenres } from 'state/Genres/selectors';
import { openLoginModal, openSignupModal } from 'state/UI/actions';
import { Props } from 'views/Welcome/Welcome';
import { State } from 'state/buildInitialState';
import type { ViewWithStatics } from 'views/ViewWithStatics';

const Welcome: ViewWithStatics = loadable(() => import('./Welcome'));

Welcome.getAsyncData = getAsyncData;
Welcome.pageInfo = pageInfo;

export default flowRight(
  connect(
    createStructuredSelector<State, Props>({
      countryCode: getCountryCode,
      customRadioEnabled: getCustomRadioEnabled,
      isAnonymous: getIsAnonymous,
      queryParams: getQueryParams,
      search: getSearch,
      selectedGenres: getSelectedGenres,
      showWelcome: getShowWelcome,
    }),
    {
      fetchGenrePreferences,
      openLogin: () => openLoginModal({ context: 'reset-password' }),
      openSignup: () => openSignupModal({ context: 'reset-password' }),
    },
  ),
  withAnalytics({ pageName: 'home' }),
)(Welcome);
