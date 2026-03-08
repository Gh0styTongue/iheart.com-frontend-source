import loadable from '@loadable/component';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getProfileId } from 'state/Session/selectors';
import { getSocial, StationContact } from 'state/Live/selectors';
import { resetSocialOpts } from 'state/SiteData/actions';
import { State } from 'state/buildInitialState';

const Social = loadable(() => import('./Social'));

export default connect(
  createStructuredSelector<
    State,
    { profileId: number | null; social: StationContact }
  >({
    profileId: getProfileId,
    social: getSocial,
  }),
  { resetSocialOpts },
)(Social);
