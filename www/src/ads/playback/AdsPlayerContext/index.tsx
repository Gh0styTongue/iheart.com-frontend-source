import AdsPlayerContext from './AdsPlayerContext';
import AdsPlayerProvider from './AdsPlayerProvider';
import AdsPlayerStateContext from '../AdsPlayerState';
import type { FunctionComponent } from 'react';

export { default as useAdsPlayer } from './useAdsPlayer';

/**
 * We are feature-flagging this code here so that we don't need to update
 * each file this code is used in once the feature goes live
 *
 * A note for self, we may want to leverage a wrapper such as this
 * to avoid loading the ads player entirely if a user is ad-free
 */
const ProviderWithFeature: FunctionComponent = ({ children }) => {
  return (
    <AdsPlayerStateContext.Provider>
      <AdsPlayerProvider>{children}</AdsPlayerProvider>
    </AdsPlayerStateContext.Provider>
  );
};

export default {
  Provider: ProviderWithFeature,
  Context: AdsPlayerContext,
  Consumer: AdsPlayerContext.Consumer,
};
