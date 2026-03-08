import PlayerColorContext from './index';
import { DefaultValue } from './PlayerColorContext';
import { useContext } from 'react';

function usePlayerColor(): DefaultValue {
  return useContext(PlayerColorContext.Context);
}

export default usePlayerColor;
