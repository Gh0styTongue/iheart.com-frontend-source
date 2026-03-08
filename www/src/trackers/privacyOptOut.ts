import getStore from 'state/factory';
import whenPopulated from 'utils/whenPopulated';
import { getPIIBlockingFromState, gpcEnabled } from 'state/Profile/actions';
import { getProfile } from 'state/Profile/selectors';
import { PIIBlockingType } from 'state/Profile/types';
import type { State } from 'state/types';

/**
 * Returns true if user has enabled CCPA, false if not.
 * @param currentState - the current application state
 * @returns whether or not the current user has enabled CCPA
 */
export function isPrivacyOptOut(currentState: State): boolean {
  const isGPCEnabled = gpcEnabled();
  if (isGPCEnabled) {
    return true;
  }

  const [piiEnabled, piiOverrideOld, piiOverrideNew] =
    getPIIBlockingFromState(currentState);
  let piiOverride = piiOverrideOld;

  if (piiOverrideNew !== undefined) {
    piiOverride = [piiOverrideNew];
    try {
      piiOverride = JSON.parse(piiOverrideNew);
      if (!Array.isArray(piiOverride)) piiOverride = [piiOverride];
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }

  piiOverride = piiOverride
    .filter(Boolean)
    .concat(currentState.user?.profile?.piiBlockingTypes ?? []);

  const types = piiOverride.filter(Boolean) || [];
  const isOptout =
    !!piiEnabled &&
    (types.includes(PIIBlockingType.CCPA) ||
      types.includes(PIIBlockingType.PPIPS));

  return isOptout;
}

export async function asyncIsPrivacyOptOut() {
  const store = getStore();
  await whenPopulated<ReturnType<typeof getProfile>>(
    store,
    getProfile,
    newValue => !!newValue?.profileReceived,
  );
  return isPrivacyOptOut(store.getState());
}
