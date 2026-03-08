import AdsPlayerStateContext from './AdsPlayerState';
import { useContext, useMemo } from 'react';

/**
 * @internal For internal use within the AdsPlayer only
 */
const useAdsPlayerActions = () => {
  const actions = useContext(AdsPlayerStateContext)[1];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => actions, []);
};

export default useAdsPlayerActions;
