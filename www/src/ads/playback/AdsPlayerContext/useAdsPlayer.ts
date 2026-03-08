import AdsPlayerContext from './AdsPlayerContext';
import { useContext } from 'react';

/**
 * Will return the adsPlayer if feature is enabled.
 */
const useAdsPlayer = () => {
  const adsPlayer = useContext(AdsPlayerContext);
  return adsPlayer;
};

export default useAdsPlayer;
