import hub, { E } from 'shared/utils/Hub';
import LegacyPlayerState from 'web-player/PlayerState';
import PlayerTimeContext from './PlayerTimeContext';
import { ReactNode, useEffect, useState } from 'react';
import { throttle } from 'lodash-es';
import type { Time } from './PlayerTimeContext';

const legacyPlayerState = LegacyPlayerState.getInstance();

type Props = {
  children: ReactNode;
};

function PlayerTimeProvider({ children }: Props) {
  const [time, setTime] = useState<Time>(() => ({
    duration: legacyPlayerState.getDuration(),
    position: legacyPlayerState.getPosition(),
  }));

  useEffect(() => {
    const update = throttle(setTime, 1000);
    hub.on(E.TIME, update);
    return () => hub.off(E.TIME, update);
  }, []);

  return (
    <PlayerTimeContext.Provider value={time}>
      {children}
    </PlayerTimeContext.Provider>
  );
}

export default PlayerTimeProvider;
