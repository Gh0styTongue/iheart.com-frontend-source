import zIndexContext from './zIndexContext';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  zIndex: number;
};

function zIndexProvider({ children, zIndex }: Props) {
  return (
    <zIndexContext.Provider value={zIndex}>{children}</zIndexContext.Provider>
  );
}

export default zIndexProvider;
