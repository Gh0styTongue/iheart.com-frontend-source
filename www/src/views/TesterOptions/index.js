import loadable from '@loadable/component';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import {
  getExpiration,
  getIsTrial,
  getSource,
  getSubscriptionType,
} from 'state/Entitlements/selectors';
import { getProfileId, getSessionId } from 'state/Session/selectors';
import { pageInfo } from './statics';

const TesterOptions = loadable(() => import('./TesterOptions'));

TesterOptions.pageInfo = pageInfo;

export default connect(
  createStructuredSelector({
    expiration: getExpiration,
    isTrial: getIsTrial,
    profileId: getProfileId,
    sessionId: getSessionId,
    subscriptionSource: getSource,
    subscriptionType: getSubscriptionType,
  }),
)(TesterOptions);
