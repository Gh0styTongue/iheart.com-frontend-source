import getPrimaryMarket from 'ads/targeting/lib/getPrimaryMarket';
import usePlayerState from 'contexts/PlayerState/usePlayerState';
import useTargetingValues from 'ads/targeting/lib/useTargetingValues';
import { DEFAULT_PLAYER_TARGETING_VALUES } from './constants';
import { getLocale } from 'state/i18n/selectors';
import { useSelector } from 'react-redux';
import type { PlayerTargetingValues, TargetingHookReturn } from './types';

type PlayerStateValues = NonNullable<ReturnType<typeof usePlayerState>>;

const buildSeedValue = (
  playerStateValues: Partial<
    Pick<PlayerStateValues, 'stationId' | 'stationType'>
  >,
) => {
  const { stationId, stationType } = playerStateValues;

  switch (stationType) {
    case 'featured':
      return `o${stationId}`;

    case 'talk':
      return `s${stationId}`;

    default:
      return stationId ? String(stationId) : null;
  }
};

export const buildProviderValue = (
  baseProvider?: string | null,
): PlayerTargetingValues['provider'] => {
  if (!baseProvider) {
    return null;
  }

  const baseProviderLC = baseProvider.toLowerCase();

  if (baseProviderLC.includes('clear channel')) {
    return 'cc';
  }

  return baseProviderLC;
};

const usePlayerTargeting = (): TargetingHookReturn<PlayerTargetingValues> => {
  const {
    markets,
    playbackType,
    playedFrom,
    stationFormat,
    stationId,
    stationProvider,
    stationType,
  } = usePlayerState() ?? {};
  const locale = useSelector(getLocale);

  return useTargetingValues(DEFAULT_PLAYER_TARGETING_VALUES, () => ({
    seed: buildSeedValue({ stationId, stationType }),
    locale: locale ?? null,
    ccrcontent2: playbackType ?? null,
    ccrformat: stationFormat ?? null,
    ccrmarket: getPrimaryMarket(markets),
    provider: buildProviderValue(stationProvider),
    playedfrom: String(playedFrom) ?? null,
  }));
};

export default usePlayerTargeting;
