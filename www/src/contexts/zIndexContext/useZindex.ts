import zIndexContext from './index';
import { useContext } from 'react';

function useZindex(): number {
  return useContext(zIndexContext.Context);
}

export default useZindex;
