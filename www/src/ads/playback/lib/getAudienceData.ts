import factory from 'state/factory';
import { getLotameInstance } from 'trackers/lotame';
import type { State } from 'state/types';

/**
 * Retrieves audience data attached to the window
 * by Lotame
 */
const store = factory();

const getAudienceData = (): null | string => {
  const state = store.getState() as State;
  const lotameClientId = state.ads?.lotame?.clientId;
  let lotameAudienceData: Array<string> = [];

  const lotame = getLotameInstance(lotameClientId);

  if (lotame && !window.ccauds) {
    lotameAudienceData = lotame.getAudiences(100) ?? [];
    return lotameAudienceData?.join(',');
  }

  // If there are no window.ccauds, let get out of here!
  if (!window.ccauds) {
    return null;
  }

  // Just incase we don't have third party audience data for this user
  if (!window.ccauds.Profile.Audiences.Audience) {
    window.ccauds.Profile.Audiences.Audience = [];
  }

  // Just incase we don't have third party audience data for this user
  if (!window.ccauds.Profile.Audiences.ThirdPartyAudience) {
    window.ccauds.Profile.Audiences.ThirdPartyAudience = [];
  }

  // Normal audience data
  const audience = window.ccauds.Profile.Audiences.Audience.map(
    obj => obj.abbr,
  );

  // Third party audience data
  const thirdPartyAudience =
    window.ccauds.Profile.Audiences.ThirdPartyAudience.map(obj => obj.name);

  // If we have third party data, add it to the audience array
  return (
    typeof thirdPartyAudience === 'object' ?
      audience.concat(thirdPartyAudience, lotameAudienceData)
    : audience.concat(lotameAudienceData)).join(',');
};

export default getAudienceData;
