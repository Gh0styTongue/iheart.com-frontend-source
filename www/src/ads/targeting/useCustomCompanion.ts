import useAdsPlayerState from 'ads/playback/AdsPlayerState/useAdsPlayerState';
import { getCompanion } from 'state/Ads/selectors';
import { useSelector } from 'react-redux';
import type { CustomAdCompanionData } from 'ads/types';

export type CustomCompanion = {
  customAdCompanionData: CustomAdCompanionData;
  isPlaying: boolean;
};

function useCustomCompanions(): CustomCompanion {
  const { adIsPresent } = useAdsPlayerState();

  const customAdCompanionData = useSelector(getCompanion);

  // TODO: just return the computed context string

  return {
    customAdCompanionData,
    isPlaying: adIsPresent,
  } as CustomCompanion;
}

export default useCustomCompanions;
