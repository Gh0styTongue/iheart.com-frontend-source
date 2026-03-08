import RightRailAd from './RightRailAd';
import { adFreeSelector } from 'state/Entitlements/selectors';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getAdvertiseLink } from 'state/Links/selectors';
import { getAppMounted } from 'state/UI/selectors';
import type { State } from 'state/buildInitialState';

type Props = {
  adFree: boolean;
  adHref: string;
  appMounted: boolean;
};

export default connect(
  createStructuredSelector<State, Props>({
    adFree: adFreeSelector,
    adHref: getAdvertiseLink,
    appMounted: getAppMounted,
  }),
)(RightRailAd);
