import abTestGroups from 'state/ABTestGroups';
import profile from 'state/Profile';
import session from 'state/Session';
import subscription from 'state/Entitlements';
import { combineReducers } from 'redux';

export default combineReducers({
  abTestGroups,
  profile,
  session,
  subscription,
});
