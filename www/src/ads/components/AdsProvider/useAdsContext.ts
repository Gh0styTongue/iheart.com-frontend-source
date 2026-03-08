import AdsContext from 'ads/components/AdsProvider/AdsContext';
import { useContext } from 'react';

const useAdsContext = () => {
  const adsContext = useContext(AdsContext);
  if (!adsContext.providerLoaded) {
    throw new Error('Ads context must be instantiated first');
  }
  return adsContext as Required<typeof adsContext>;
};

export default useAdsContext;
