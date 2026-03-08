import AdsPlayerStateContext from './AdsPlayerState';
import { useContext } from 'react';
import type { AdsPlayerState } from './AdsPlayerState';

/**
 * Exposes AdPlayerState for downstream components to subscribe to
 */
const useAdsPlayerState = (): AdsPlayerState => {
  const [state] = useContext(AdsPlayerStateContext);
  return state;
};

export default useAdsPlayerState;
