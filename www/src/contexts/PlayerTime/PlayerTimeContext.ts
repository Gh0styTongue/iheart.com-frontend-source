import { createContext } from 'react';

export type Time = {
  duration: number;
  position: number;
};

const PlayerTimeContext = createContext<Time>({
  duration: 0,
  position: 0,
});

export default PlayerTimeContext;
