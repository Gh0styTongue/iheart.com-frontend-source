import theme from 'styles/themes/default';
import { createContext } from 'react';

const PlayerColorContext = createContext<number>(theme.zIndex.modal);

export default PlayerColorContext;
