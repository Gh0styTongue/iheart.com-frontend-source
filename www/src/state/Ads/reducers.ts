import { CustomAds, StationTargetingInfo, Triton } from './types';
import { StationTypeValue } from 'constants/stationTypes';

export function newCustomCompanion(state: CustomAds, payload: any) {
  return {
    ...state,
    companion: payload,
  };
}

export function setTritonParternIds(state: CustomAds, payload: any) {
  return { ...state, tritonPartnerIds: payload };
}

export function receiveStationTargettingParams(
  state: StationTargetingInfo,
  payload: {
    params: any;
    stationId: string;
    stationType: StationTypeValue;
  },
) {
  return payload;
}

export function setTFCDAgeLimit(
  state: number | null,
  ageLimit: number | null = null,
) {
  return ageLimit;
}

export function RecieveTritonSecureToken(
  state: Triton,
  { token, expirationDate }: { token: string; expirationDate: number },
) {
  return {
    ...state,
    tritonSecureToken: token,
    tritonSecureTokenExpirationDate: expirationDate,
  };
}
