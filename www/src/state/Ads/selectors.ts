import { State as Ads, CustomAds } from './types';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import { getAge } from 'state/Profile/selectors';
import { getLangPrefix } from 'state/i18n/selectors';
import { Selector } from 'state/types';
import { State } from 'state/buildInitialState';
import type { CustomAdCompanionData } from 'ads/types';

export function getAds(state: State): Ads {
  return state?.ads;
}

export const getAdInterval = createSelector<State, Ads, Ads['adInterval']>(
  getAds,
  ads => get(ads, 'adInterval', 600000),
);

export const getIAS = createSelector<State, Ads, Ads['ias']>(getAds, ads =>
  get(ads, 'ias'),
);

export const getCustomAds = createSelector<State, Ads, Ads['customAds']>(
  getAds,
  ads => get(ads, 'customAds'),
);

export const getIsPlayingCustomAd = createSelector<
  State,
  Ads['customAds'],
  boolean
>(getCustomAds, state => get(state, 'playing', false));

export const getCustomAdsEnabled = createSelector<
  State,
  Ads['customAds'],
  boolean
>(getCustomAds, state => state.enableCustomAds);

export const getCustomAdsType = createSelector<State, Ads['customAds'], string>(
  getCustomAds,
  state => state?.type ?? '',
);

export const getTritonAdsUrl = createSelector<State, Ads['customAds'], string>(
  getCustomAds,
  state => state?.url ?? '',
);

export const getCompanion = createSelector<
  State,
  Ads['customAds'],
  CustomAdCompanionData | null
>(getCustomAds, state => state?.companion ?? null);

export const getTritonPartnerUrl = createSelector<
  State,
  Ads['customAds'],
  CustomAds['partnerIds']
>(getCustomAds, state => state?.partnerIds ?? '');

export const getTritonPartnerIds = createSelector<
  State,
  Ads['customAds'],
  CustomAds['tritonPartnerIds']
>(getCustomAds, state => state?.tritonPartnerIds ?? {});

export const getLotame: (state: any) => {
  [a: string]: any;
} = createSelector(getAds, state => get(state, 'lotame', {}));

export function makeGetLotame(key: any, fallback: any): any {
  return createSelector(getLotame, lotame => get(lotame, key, fallback));
}

export const getLotameNetworkId: (state: any) => number = makeGetLotame(
  'networkId',
  4085,
);
export const getLotameThirdPartyId: (state: any) => string = makeGetLotame(
  'thirdPartyId',
  'CLCH',
);

export const getAdEnv: (state: any) => string = createSelector(
  getAds,
  state => state.env,
);

export const getAdswizz: (state: any) => {
  [a: string]: any;
} = createSelector(getAds, state => get(state, 'adswizz', {}));

export const getTriton: (state: any) => {
  [a: string]: any;
} = createSelector(getAds, state => get(state, 'triton', {}));

export const getTritonConfigDesktop: (state: any) => {
  [a: string]: any;
} = createSelector(getTriton, triton => get(triton, 'desktop', {}));

export const getTritonConfigMobile: (state: any) => {
  [a: string]: any;
} = createSelector(getTriton, triton => get(triton, 'mobile', {}));

export const getTritonSecureTokenData = createSelector(
  getTriton,
  ({ tritonSecureToken, tritonSecureTokenExpirationDate }) => ({
    tritonSecureToken,
    tritonSecureTokenExpirationDate,
  }),
);

export const getGoogleTag: (state: any) => {
  [a: string]: any;
} = createSelector(getAds, ads => get(ads, 'googleTag', {}));

export const getDFPId: (state: any) => string = createSelector(
  getGoogleTag,
  googleTag => get(googleTag, 'dfpInstanceId', '6663'),
);

export const getCompanionZones: (state: any) => number = createSelector(
  getAdswizz,
  state => state.companionZones,
);

export const getSubdomain: (state: any) => string = createSelector(
  getAdswizz,
  state => state.subdomain,
);

export const getZoneId: (state: any) => number = createSelector(
  getAdswizz,
  state => state.zoneId,
);

export const getAdsSuppressed: (state: any) => boolean = createSelector(
  getAds,
  ads => get(ads, 'suppressAds', false),
);

export const getStationTargetingInfo = createSelector(
  getAds,
  ads => ads?.stationTargetingInfo ?? {},
);

export const getStationTargetingParams: Selector<any> = createSelector(
  getStationTargetingInfo,
  targetingData => get(targetingData, 'params', {}),
);

export const getRubiconScriptUrl = (state: State) =>
  get(state, ['ads', 'rubicon', 'script'], '');

export const getApsScriptUrl = (state: State) =>
  get(state, ['ads', 'amazon', 'script'], '');

export const getApsPubId = (state: State) =>
  get(state, ['ads', 'amazon', 'pubId'], '');

const getIndexExchange = (state: State): Record<string, string> =>
  get(state, ['ads', 'indexExchange', 'scripts'], {});

export const getIndexExchangeScriptUrl: Selector<string> = createSelector(
  getLangPrefix,
  getIndexExchange,
  (langPrefix: string, scripts: any) =>
    scripts[langPrefix] ?? scripts.en ?? null,
);

export const getTFCDAgeLimitApplies: Selector<boolean> = createSelector(
  getAds,
  getAge,
  ({ TFCD }, userAge) => Boolean(TFCD && (!userAge || userAge <= TFCD)),
);
