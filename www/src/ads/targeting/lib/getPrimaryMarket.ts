import type usePlayerState from 'contexts/PlayerState/usePlayerState';

type Markets = NonNullable<ReturnType<typeof usePlayerState>>['markets'];

const getPrimaryMarket = (markets?: Markets) => {
  if (!markets) {
    return null;
  }

  const market = markets.filter(m => m.primary)[0];

  if (market?.name === 'DIGITAL-NAT') {
    return 'DIGITALCHANNELS';
  }

  return market?.name ?? null;
};

export default getPrimaryMarket;
