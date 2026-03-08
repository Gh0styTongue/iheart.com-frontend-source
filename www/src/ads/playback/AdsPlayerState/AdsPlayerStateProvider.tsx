import AdsPlayerStateContext, {
  AdPlaybackState,
  initialState,
} from './AdsPlayerState';
import { useMemo, useState } from 'react';
import type { AdsPlayerActions, AdsPlayerState } from './AdsPlayerState';
import type { FunctionComponent } from 'react';

const AdsPlayerStateProvider: FunctionComponent = ({ children }) => {
  const [adPlaybackState, setAdPlaybackState] = useState(
    initialState.adPlaybackState,
  );
  const [adMediaType, setAdMediaType] = useState(initialState.adMediaType);
  const [adTime, setAdTime] = useState(initialState.adTime);

  const state: AdsPlayerState = useMemo(() => {
    return {
      adIsPlaying:
        adPlaybackState === AdPlaybackState.Buffering ||
        adPlaybackState === AdPlaybackState.Playing,
      adIsPresent: adPlaybackState !== AdPlaybackState.Idle,
      adPlaybackState,
      adTime,
      adMediaType,
    };
  }, [adPlaybackState, adTime, adMediaType]);

  // No need to feature flag the setters, as they are only used internally
  const actions: AdsPlayerActions = useMemo(
    () => ({
      setAdMediaType,
      setAdPlaybackState,
      setAdTime,
    }),
    [],
  );

  const context: [AdsPlayerState, AdsPlayerActions] = useMemo(
    () => [state, actions],
    [state, actions],
  );

  return (
    <AdsPlayerStateContext.Provider value={context}>
      {children}
    </AdsPlayerStateContext.Provider>
  );
};

export default AdsPlayerStateProvider;
