import { checkPIIBlockingType } from 'state/Profile/actions';
import { CONTEXTS } from 'modules/Logger';
import { ENTITLEMENTS_LOADED } from 'state/Entitlements/constants';
import { getAmpUrl, getCountryCode } from 'state/Config/selectors';
import { getCountryLocationConfig } from 'state/Config/services';
import { getCredentials } from 'state/Session/selectors';
import { getEnv } from 'state/Environment/selectors';

export function entitlementsLoaded(subInfo) {
  return {
    meta: {
      analytics: {
        data: {
          user: {
            isTrialEligible: subInfo.isTrialEligible,
            skuPromotionType: subInfo.productId,
            subscriptionTier: subInfo.subscriptionType,
          },
        },
      },
    },
    payload: subInfo,
    type: ENTITLEMENTS_LOADED,
  };
}

export function loadEntitlements() {
  return (dispatch, getState, { logger, transport }) => {
    const state = getState();
    const { profileId, sessionId } = getCredentials(state);
    const ampUrl = getAmpUrl(state);
    const env = getEnv(state);
    const countryCode = getCountryCode(state);

    return transport(
      getCountryLocationConfig(ampUrl, env, countryCode, {
        profileId,
        sessionId,
      })(),
    )
      .then(({ data }) => {
        // TODO: the ccpa flag isn't being set yet and we're still waiting on where the flag will be
        // data.ccpa so this is exclusively and specifically a placeholder.
        dispatch(checkPIIBlockingType(data.privacyCompliance));

        return dispatch(entitlementsLoaded(data.subscription));
      })
      .catch(err => {
        const errObj = err instanceof Error ? err : new Error(err);
        logger.error([CONTEXTS.REDUX, CONTEXTS.SUBSCRIPTION], err, {}, errObj);
        throw err;
      });
  };
}
