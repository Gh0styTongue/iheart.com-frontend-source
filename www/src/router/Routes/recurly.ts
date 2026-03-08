import paths from './paths';
import recurly from 'views/Recurly';
import recurlyConfirmation from 'views/RecurlyConfirmation';
import RecurlyHistory from 'views/Profile/RecurlyBillingHistory';
import RecurlyUpdatePayment from 'views/Profile/RecurlyUpdatePayment';
import UpgradeRecurly from 'views/RecurlyUpgrade';

export default [
  {
    component: recurly,
    exact: true,
    path: paths.recurly.subscribe,
  },
  {
    component: recurlyConfirmation,
    exact: true,
    path: paths.recurly.confirmation,
  },
  {
    component: RecurlyUpdatePayment,
    exact: true,
    path: paths.recurly.updatePayment,
  },
  {
    component: RecurlyHistory,
    exact: true,
    path: paths.recurly.history,
  },
  {
    component: UpgradeRecurly,
    exact: true,
    path: paths.recurly.upgrade,
  },
];
