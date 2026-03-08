import loadable from '@loadable/component';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getCountryCode } from 'state/Config/selectors';
import {
  getCurrentCoordinates,
  getCurrentMarket,
  getCurrentZip,
} from 'state/Location/selectors';
import { getProfileId } from 'state/Session/selectors';
import { getSubscriptionType } from 'state/Entitlements/selectors';
import { Props } from './UserInfo';
import { State } from 'state/types';

const UserInfo = loadable(() => import('./UserInfo'));

export default connect(
  createStructuredSelector<State, Props>({
    coordinates: getCurrentCoordinates,
    country: getCountryCode,
    market: getCurrentMarket,
    postCode: getCurrentZip,
    profileId: getProfileId,
    subscription: getSubscriptionType,
  }),
)(UserInfo);
