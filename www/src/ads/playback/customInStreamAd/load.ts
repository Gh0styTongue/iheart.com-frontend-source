import factory from 'state/factory';
import getAdswizzVastAd from './lib/getAdswizzVastAd';
import getListenerId from './lib/getListenerId';
import getTritonVastAd from './lib/getTritonVastAd';
import { CustomAdTypes } from './constants';
import { getPlaylistRadioAdsEnabled } from 'state/Features/selectors';
import { STATION_TYPE } from 'constants/stationTypes';
import type { CustomInStreamAdMethods } from './types';

const store = factory();

// Unfortunately, the typings for these models are outdated / incomplete
// and do not account for the properties we need to access.
const load: CustomInStreamAdMethods['load'] =
  ({ getState }) =>
  async (station: any) => {
    const { isEnabled, customAdsType } = getState();

    if (!isEnabled || !station || !customAdsType) return null;

    const state = store.getState();
    const isCustom = station.get('type') === STATION_TYPE.CUSTOM;
    const isPlaylistRadio =
      station.get('type') === STATION_TYPE.PLAYLIST_RADIO &&
      getPlaylistRadioAdsEnabled(state);

    const stationShouldBeChecked =
      (isCustom || isPlaylistRadio) &&
      !station.get('isNew') &&
      station.get('checkAd');

    if (!stationShouldBeChecked) return null;

    const listenerId = getListenerId(customAdsType);
    let customSessionId: string | null = station.get('customSessionId');
    let sessionStart = false;

    // Each custom station has one unique `customSessionId` lasting the whole station lifespan
    if (!customSessionId) {
      customSessionId = `${listenerId}-${Math.floor(Date.now() / 1000)}`;
      station.set({ customSessionId });
      sessionStart = true;
    }

    let url: null | string = null;

    if (customAdsType === CustomAdTypes.Adswizz) {
      url = getAdswizzVastAd({ customSessionId, sessionStart, station });
    } else if (customAdsType === CustomAdTypes.Triton) {
      url = getTritonVastAd({ sessionStart, station });
    }

    return url;
  };

export default load;
