import PlayerTimeContext from './PlayerTimeContext';
import { useContext } from 'react';
import type { Time } from './PlayerTimeContext';

function usePlayerTime(): Time {
  return useContext(PlayerTimeContext);
}

export default usePlayerTime;
