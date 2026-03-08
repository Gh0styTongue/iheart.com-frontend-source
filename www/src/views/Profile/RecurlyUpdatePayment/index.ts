import loadable from '@loadable/component';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getAmpUrl, getRecurly } from 'state/Config/selectors';
import { getProfileId, getSessionId } from 'state/Session/selectors';
import { getUserType } from 'state/User/selectors';
import { navigate } from 'state/Routing/actions';
import { pageInfo } from './statics';
import { ViewWithStatics } from 'views/ViewWithStatics';

import type { ConnectedProps } from './RecurlyUpdatePayment';
import type { State } from 'state/types';

const RecurlyUpdatePayment = loadable(
  () => import('./RecurlyUpdatePayment'),
) as ViewWithStatics;

RecurlyUpdatePayment.pageInfo = pageInfo;

export default connect(
  createStructuredSelector<State, ConnectedProps>({
    ampUrl: getAmpUrl,
    profileId: getProfileId,
    recurlyKey: getRecurly,
    sessionId: getSessionId,
    subscription: getUserType,
  }),
  {
    navigate,
  },
)(RecurlyUpdatePayment);
