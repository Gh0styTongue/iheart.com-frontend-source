import FamilyPlanValidationView from 'views/FamilyPlan';
import paths from './paths';
import PromoView from 'views/Promo';
import Settings from 'views/Profile/Settings';
import Songs from 'views/Profile/Songs';
import { getCountryCode } from 'state/Config/selectors';
import { State } from 'state/types';

// active func receives the country code and checks if current code is US
const isUS = (state: State) => ['US'].includes(getCountryCode(state));

export default [
  {
    component: Songs,
    exact: true,
    path: paths.profile.songs,
  },
  {
    component: Settings,
    exact: true,
    path: paths.profile.settings,
  },
  {
    active: isUS,
    component: PromoView,
    exact: true,
    path: paths.profile.promo,
  },
  {
    active: isUS,
    component: FamilyPlanValidationView,
    exact: true,
    path: paths.profile.familyValidation,
  },
];
