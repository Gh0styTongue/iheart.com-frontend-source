import theme from 'styles/themes/default';
import { createContext } from 'react';

export type DefaultValue = {
  playerColor: string;
  setPlayerColor: (color: string) => void;
};

const PlayerColorContext = createContext<DefaultValue>({
  playerColor: theme.colors.gray['600'],
  setPlayerColor: () => theme.colors.gray['600'],
});

export default PlayerColorContext;
