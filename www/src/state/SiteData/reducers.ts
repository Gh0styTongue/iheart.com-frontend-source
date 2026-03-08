import { merge, set } from 'lodash-es';
import { RecurlyPlan, RecurlySkus, State } from './types';

export function resetSocialOpts(): State {
  return {
    socialOpts: {
      supportsConnect: false,
      supportsShare: true,
    },
  };
}

export function setSocialOpts(
  state: State,
  {
    supportsConnect,
  }: {
    supportsConnect: boolean;
  },
): State {
  return set(
    merge({}, state),
    ['socialOpts', 'supportsConnect'],
    supportsConnect,
  );
}

export function setRecurlySkus(
  state: State,
  { availablePlans }: { availablePlans: [RecurlyPlan] },
): State {
  const skusObj: RecurlySkus = {};
  availablePlans.map((plan: RecurlyPlan) => {
    skusObj[plan.code] = plan;
    return plan;
  });

  return set(merge({}, state), ['recurly', 'skus'], skusObj);
}
