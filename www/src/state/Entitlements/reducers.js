import { cloneDeep } from 'lodash-es';
import { getTrialMonths } from './helpers';
import { initialState } from './index';

export function subInfoLoaded(
  state,
  {
    entitlements,
    expirationDate,
    hasBillingHistory = false,
    isAutoRenewing = null,
    isEligibleForAnotherTrial = false,
    isFamilyPlanParent,
    isTrial = false,
    isTrialEligible = false,
    productId,
    source,
    subscriptionType = 'NONE',
  },
) {
  return {
    ...state,
    entitlements: entitlements.reduce(
      (memo, entitlement) => ({ ...memo, [entitlement]: true }),
      {},
    ),
    subInfo: {
      expiration: expirationDate || null,
      hasBillingHistory,
      isAutoRenewing,
      /**
       * BEGIN: AMP - LOGIC:
       * IF isFamilyPlanParent is set you are in the context of family plan,
       * if this value is true you are a parent of the said family plan,
       * if this value is false then you are child
       * if this key is not set at all then there is no family plan you are an
       * individual user.
       * END: AMP - LOGIC
       *
       * Ok this logic is to coerce is family plan parent to a boolean so that we can
       * correct determine if you are either a family plan parent or a child or you are
       * normal user.
       * isFamilyPlanParent can return as true , false or undefined. <--
       *  */

      isFamilyPlanChild: isFamilyPlanParent === false,
      isFamilyPlanParent: !!isFamilyPlanParent,
      isTrial,
      isTrialEligible: isTrialEligible || isEligibleForAnotherTrial,
      source,
      subInfoLoaded: true,
      subscriptionType,
      trialMonths: isTrial ? getTrialMonths(productId) : undefined,
    },
  };
}

export function logout() {
  return cloneDeep(initialState);
}
