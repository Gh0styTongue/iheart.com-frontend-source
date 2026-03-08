import getPrimaryMarket from 'ads/targeting/lib/getPrimaryMarket';
import usePlayerState from 'contexts/PlayerState/usePlayerState';
import { getDFPId } from 'state/Ads/selectors';
import { PLAYER_STATE } from 'constants/playback';
import { STATION_TYPE } from 'constants/stationTypes';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { AdUnit } from 'ads/types';

// LEGACY: See app/web-ads/lib/ads/Slot.js

// there's a random component to every adUnit, so we need a way so that once computed for a given unit it is never recomputed
// so that all useAdUnit consumers get the same value for each adUnit.
const postFixMemoizer: Record<string, '.n' | ''> = {};

const ReplaceMePostFix = '~~~POSTFIX~~~';

const ProviderMap = {
  '': 'ccr',
  'clear channel': 'ccr',
  'clear channel australia': 'cle',
  'clear channel new zealand': 'cle',
  'bell media': 'bel',
  emmis: 'emm',
};

const useAdUnit = (): AdUnit => {
  const {
    callLetters,
    markets,
    playbackState,
    playbackType, // type
    stationProvider, // provider
    stationType,
  } = usePlayerState() ?? {};

  const adId = useSelector(getDFPId);

  const template = useMemo(() => {
    if (!stationType) {
      return '';
    }

    const isPlaying = playbackState !== PLAYER_STATE.PAUSED;

    if (!isPlaying) {
      return `/${adId}/ccr.ihr/ihr4`;
    }

    if (playbackType?.toLowerCase() !== STATION_TYPE.LIVE) {
      return `/${adId}/ccr.ihr${ReplaceMePostFix}/customtalk`;
    }

    const provider =
      ProviderMap[
        (stationProvider || '').toLowerCase() as keyof typeof ProviderMap
      ] || ProviderMap[''];

    const primaryMarket = (getPrimaryMarket(markets) || '')
      .toLowerCase()
      .replace('-', '.');

    return `/${adId}/${[provider, primaryMarket]
      .filter(el => el)
      .join('.')}${ReplaceMePostFix}/${(callLetters || '').toLowerCase()}`;
  }, [
    callLetters,
    markets,
    playbackState,
    playbackType,
    stationProvider,
    stationType,
    adId,
  ]);

  return useMemo(() => {
    const prevPostfixForTemplate = postFixMemoizer[template];

    const postfix = prevPostfixForTemplate || Math.random() < 0.5 ? '.n' : '';
    postFixMemoizer[template] = postfix;

    const adUnit = template.replace(ReplaceMePostFix, postfix);

    return adUnit;
  }, [template]);
};

export default useAdUnit;
