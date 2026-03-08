import getPermutive from 'ads/shims/getPermutive';
import useTargetingValues from 'ads/targeting/lib/useTargetingValues';
import { DEFAULT_USER_TARGETING_VALUES } from './constants';
import {
  getAccountType,
  getAge,
  getGender,
  getPiiBlockingTypes,
  getZipCode,
} from 'state/Profile/selectors';
import { getAdEnv } from 'state/Ads/selectors';
import { getCountryCode } from 'state/Config/selectors';
import { getDeviceId, getProfileId } from 'state/Session/selectors';
import { getIsMobile } from 'state/Environment/selectors';
import { getVisitNum } from 'ads/shims/visitNum';
import { isPrivacyOptOut } from 'state/Profile/actions';
import { useSelector } from 'react-redux';
import type { GlobalTargetingValues, TargetingHook } from './types';

const SANITIZED_TARGETING_VALUES = {
  age: null,
  country: null,
  deviceType: null,
  gender: null,
  zip: null,
  us_privacy: '1-Y-',
} as const;

const parseValue = (value: number | string | undefined | null) =>
  value !== null && value !== undefined ? String(value) : null;

const useUserTargeting: TargetingHook<GlobalTargetingValues> = adsConfig => {
  const { isPIIRestricted } = adsConfig;

  const accountType = useSelector(getAccountType);
  const age = useSelector(getAge);
  const adEnv = useSelector(getAdEnv);
  const countryCode = useSelector(getCountryCode);
  const gender = useSelector(getGender);
  const permutive = getPermutive();
  const profileId = useSelector(getProfileId);
  const deviceId = useSelector(getDeviceId);
  const isMobile = useSelector(getIsMobile);
  const zipCode = useSelector(getZipCode);
  const piiBlockingTypes = useSelector(getPiiBlockingTypes);
  const isOptout = isPrivacyOptOut(piiBlockingTypes);

  return useTargetingValues(DEFAULT_USER_TARGETING_VALUES, () => ({
    accountType: parseValue(accountType),
    age: parseValue(age),
    country: parseValue(countryCode),
    deviceType: isMobile ? 'mobile' : 'desktop',
    env: parseValue(adEnv),
    gender: parseValue(gender),
    ihrtoo: isOptout ? '0' : '1',
    ...(permutive ? { permutive } : {}),
    profileId: parseValue(profileId ?? deviceId),
    visitNum: String(getVisitNum()),
    zip: parseValue(zipCode),

    // If user has opted out of PII, scrub identifying information.
    ...(isPIIRestricted ? { ...SANITIZED_TARGETING_VALUES } : {}),
  }));
};

export default useUserTargeting;
