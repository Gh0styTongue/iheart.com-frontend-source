import useAdsPlayerState from '../AdsPlayerState/useAdsPlayerState';
import type { ComponentType } from 'react';

/**
 * Wraps the component with useAdsPlayerState functionality
 * @deprecated Avoid using this, instead prefer `useAdsPlayerState`
 */
const withAdsPlayer =
  <T extends { adsPlayerState?: ReturnType<typeof useAdsPlayerState> }>(
    Component: ComponentType<T>,
    // eslint-disable-next-line react/display-name
  ): typeof Component =>
  props => {
    const adsPlayerState = useAdsPlayerState();
    const allProps = { adsPlayerState, ...props };

    // @ts-ignore
    return <Component {...allProps} />;
  };

export default withAdsPlayer;
