import PlayerStateContext from './PlayerStateContext';
import { useContext } from 'react';
import type { PlayerState } from 'components/Player/PlayerState/types';

function usePlayerState(): PlayerState | null {
  return useContext(PlayerStateContext);
}

export default usePlayerState;
