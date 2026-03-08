import loadable from '@loadable/component';
import { AuthModals } from 'components/Auth/constants';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { flowRight } from 'lodash-es';
import { getAppsMobileLink } from 'state/Links/selectors';
import { getIsLoggedOut } from 'state/Session/selectors';
import { getShowLoginInNav } from 'state/Features/selectors';
import { getTruncatedUsernameSelector } from 'state/Profile/selectors';
import { hideSideNav, openAuthModal } from 'state/UI/actions';
import { isShowingSideNav } from 'state/UI/selectors';
import { localize } from 'redux-i18n';
import { logoutAndStartAnonymousSession } from 'state/Session/actions';
import type { Connected } from './SideNav';
import type { State } from 'state/types';

const SideNav = loadable(() => import('./SideNav'));

export default flowRight(
  localize('translate'),
  connect(
    createStructuredSelector<State, Connected>({
      appsMobileLink: getAppsMobileLink,
      displayName: getTruncatedUsernameSelector(16),
      isLoggedOut: getIsLoggedOut,
      showingSideNav: isShowingSideNav,
      showLoginInNav: getShowLoginInNav,
    }),
    {
      hideSideNav,
      logoutAndStartAnonymousSession,
      openAuthModal: (modal: AuthModals) =>
        openAuthModal({ modal, trackingContext: { context: 'sidenav' } }),
    },
  ),
)(SideNav);
