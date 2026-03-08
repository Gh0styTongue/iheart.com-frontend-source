import hub from 'shared/utils/Hub';
import PlayerStateContext from './PlayerStateContext';
import { createStructuredSelector } from 'reselect';
import { getAllStations } from 'state/Stations/selectors';
import { getConfig } from 'state/Config/selectors';
import { getEntitlements } from 'state/Entitlements/selectors';
import { getIsPlayingCustomAd } from 'state/Ads/selectors';
import { getPlayerState } from 'components/Player/PlayerState/shims';
import { playerStateChangeEvents } from 'components/Player/PlayerState/constants';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { Entitlements } from 'state/Entitlements/types';
import type { PlayerState } from 'components/Player/PlayerState/types';
import type { State } from 'state/types';
import type { Station } from 'state/Stations/types';

type WatchedState = {
  config: State['config'];
  entitlements: Entitlements;
  isPlayingCustomAd: boolean;
  stations: Array<Station>;
};

const playerStateSelector = createStructuredSelector<State, WatchedState>({
  config: getConfig,
  entitlements: getEntitlements,
  // IHRWEB-15411 keeping, but highlighting, for Web-Ads 2.0 implementation (MP)
  isPlayingCustomAd: getIsPlayingCustomAd,
  stations: getAllStations,
});

type Props = {
  children: ReactNode;
};

function PlayerStateProvider({ children }: Props) {
  const globalPlayerState = useSelector(playerStateSelector);
  const [playerState, setPlayerState] = useState<PlayerState | null>(
    getPlayerState,
  );

  // Refresh our values. All values come from "getPlayerState".
  const update = useCallback(() => setPlayerState(getPlayerState), []);

  // Call update when any "playerStateChangeEvents" hub events fire.
  useEffect(() => {
    const events = playerStateChangeEvents.join(' ');
    hub.on(events, update);
    return () => hub.off(events, () => update());
  }, [update]);

  // Call update when any values from "playerStateSelector" change.
  useEffect(() => {
    update();
  }, [globalPlayerState, update]);

  return (
    <PlayerStateContext.Provider value={playerState}>
      {children}
    </PlayerStateContext.Provider>
  );
}

export default PlayerStateProvider;
