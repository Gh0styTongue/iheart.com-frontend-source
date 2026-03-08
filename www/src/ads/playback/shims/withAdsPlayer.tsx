import useAdsPlayer from '../AdsPlayerContext/useAdsPlayer';
import type { ComponentType } from 'react';

/**
 * Wraps the component with useAdsPlayer functionality
 * @deprecated Avoid using this, instead prefer `useAdsPlayer`
 */
const withAdsPlayer =
  (
    Component: ComponentType<{ adsPlayer?: ReturnType<typeof useAdsPlayer> }>,
    // eslint-disable-next-line react/display-name
  ): typeof Component =>
  props => {
    const adsPlayer = useAdsPlayer();
    const allProps = { adsPlayer, ...props };

    return <Component {...allProps} />;
  };

export default withAdsPlayer;
