import PlayerColorContext from './PlayerColorContext';
import { ReactNode, useState } from 'react';

type Props = {
  children: ReactNode;
  color: string;
};

function PlayerColorProvider({ children, color }: Props) {
  const [playerColor, setPlayerColor] = useState(color);
  return (
    <PlayerColorContext.Provider value={{ playerColor, setPlayerColor }}>
      {children}
    </PlayerColorContext.Provider>
  );
}

export default PlayerColorProvider;
