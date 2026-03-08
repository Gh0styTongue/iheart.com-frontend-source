import countryCodes from 'constants/countryCodes';
import createVASTAdTagURL from '../lib/createVASTAdTagURL';
import factory from 'state/factory';
import getAudienceData from 'ads/playback/lib/getAudienceData';
import getLiveAdUnit from 'ads/playback/lib/getLiveAdUnit';
import localStorage from 'utils/localStorage';
import whenPopulated from 'utils/whenPopulated';
import { buildProviderValue } from 'ads/targeting/usePlayerTargeting';
import { DEFAULT_LIVE_PARAMS, LIVE_PREROLL_KEY } from './constants';
import { fetchAmazonBids } from 'ads/headerBidding/amazon';
import {
  getAdInterval,
  getDFPId,
  getTFCDAgeLimitApplies,
} from 'state/Ads/selectors';
import { getCountryCode } from 'state/Config/selectors';
import { getLiveStation } from 'state/Live/selectors';
import { getPermutiveSegments } from 'vendor/permutive';
import { getTargeting, setPlayerTargeting } from 'state/Targeting';
import { isPrivacyOptOut } from 'trackers/privacyOptOut';
import { liveResolver } from 'state/Player/resolvers/live';
import { requestSingleStation } from 'state/Live/actions';
import { setTFCDAge } from 'state/Ads/actions';
import { State } from 'state/buildInitialState';
import type { LivePrerollMethods } from './types';

import qs from 'qs';

const store = factory();

const load: LivePrerollMethods['load'] =
  ({ getState }) =>
  async ({ stationId, stationType, playedFrom }) => {
    const { isEnabled } = getState();
    const state = store.getState();
    const countryCode = getCountryCode(state);
    const adInterval = getAdInterval(state);
    const { playerTargeting: currentTargeting } = getTargeting(state);

    if (!isEnabled) return null;

    const lastPrerollTime = localStorage.getItem(LIVE_PREROLL_KEY, 0);
    const isReady = lastPrerollTime + adInterval < Date.now();

    if (!isReady) return null;

    const permutiveSegments =
      countryCode === countryCodes.CA ?
        await getPermutiveSegments()
      : undefined;

    await Promise.all([
      new Promise<void>(resolve => {
        liveResolver({
          partialLoad: false,
          stationId,
          store,
          playedFrom: String(playedFrom),
          stationType,
        }).then(async station => {
          await store.dispatch(setTFCDAge(station.ageLimit));
          await store.dispatch(
            setPlayerTargeting({
              locale: currentTargeting.locale,
              playedfrom: String(playedFrom),
              seed: String(station.seedId),
              ccrformat: station.format,
              ccrcontent2: station.responseType,
              ccrmarket: station.markets?.[0].name,
              provider: buildProviderValue(station.provider),
              ...(permutiveSegments ?
                { permutive: permutiveSegments }
              : undefined),
            }),
          );
          resolve();
        });
      }),
      whenPopulated<ReturnType<typeof getLiveStation>>(
        store,
        (liveState: State) => getLiveStation(liveState, { stationId }),
        station => !!station && !!station.callLetters,
      ),
    ]);

    const defaultParams = {
      ccauds: getAudienceData(),
      ccrpos: 7005,
      ord: Date.now(),
      streamtype: 'live',
    };

    const { playerTargeting, globalTargeting } = getTargeting(store.getState());
    const ccpaApplies = isPrivacyOptOut(store.getState());
    const apsTargeting = await fetchAmazonBids(
      'preroll',
      [[640, 480]],
      'video',
    );

    const custParams = {
      ...defaultParams,
      ...globalTargeting,
      ...playerTargeting,
      ...(ccpaApplies ?
        {
          age: null,
          gender: null,
          zip: null,
        }
      : {}),
    };

    let liveStation = getLiveStation(store.getState(), {
      stationId,
    });

    if (Object.keys(liveStation).length === 0) {
      await store.dispatch(requestSingleStation(stationId.toString()));

      liveStation = getLiveStation(store.getState(), {
        stationId,
      });
    }

    const { callLetters, provider, markets } = liveStation;

    const primaryMarketName = markets?.[0]?.name;

    const tfcdApplies = getTFCDAgeLimitApplies(store.getState());
    const adId = getDFPId(store.getState());
    const parsedAPSTargeting =
      typeof apsTargeting === 'string' ? String(apsTargeting) : undefined;

    const params = {
      ...DEFAULT_LIVE_PARAMS,
      tfcd: tfcdApplies ? 1 : 0,
      rdp: ccpaApplies ? 1 : 0,
      correlator: Date.now(),
      iu: getLiveAdUnit({
        adId,
        callLetters,
        provider,
        marketName: primaryMarketName ?? '',
      }),
      cust_params: qs.stringify(custParams) + parsedAPSTargeting,
      description_url: encodeURIComponent(window.location.href),
    };

    const { url } = createVASTAdTagURL(params);

    return url;
  };
export default load;
