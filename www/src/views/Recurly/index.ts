import loadable from '@loadable/component';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getAmpUrl, getRecurly } from 'state/Config/selectors';
import { getEmail } from 'state/Profile/selectors';
import {
  getIsAnonymous,
  getProfileId,
  getSessionId,
} from 'state/Session/selectors';
import {
  getIsTrial,
  getSource,
  getSubscriptionType,
} from 'state/Entitlements/selectors';
import { localize } from 'redux-i18n';
import { openLoginModal } from 'state/UI/actions';
import { State } from 'state/types';
import { ViewWithStatics } from 'views/ViewWithStatics';

type Selectors = {
  accountEmail?: string | null;
  ampUrl: string;
  isAnonymous: boolean;
  isTrial: boolean;
  profileId: number | null;
  recurlyKey?: string;
  sessionId: string | null;
  subscription?: string;
  userSubSource: string;
};

const Recurly = loadable(() => import('./Recurly')) as ViewWithStatics;

export default compose(
  localize('translate'),
  connect(
    createStructuredSelector<State, Selectors>({
      accountEmail: getEmail,
      ampUrl: getAmpUrl,
      isAnonymous: getIsAnonymous,
      isTrial: getIsTrial,
      profileId: getProfileId,
      recurlyKey: getRecurly,
      sessionId: getSessionId,
      subscription: getSubscriptionType,
      userSubSource: getSource,
    }),
    {
      openLogin: () => openLoginModal({ context: 'profile' }),
    },
  ),
)(Recurly);
