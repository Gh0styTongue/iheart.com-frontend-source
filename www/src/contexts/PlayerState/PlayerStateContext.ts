import { createContext } from 'react';
import type { PlayerState } from 'components/Player/PlayerState/types';

const PlayerStateContext = createContext<PlayerState | null>(null);

export default PlayerStateContext;
