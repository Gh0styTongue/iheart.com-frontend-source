import Button from 'components/Player/primitives/Button';
import LoadingIcon from 'styles/icons/player/Controls/Play/LoadingIcon';
import PauseIcon from 'styles/icons/player/Controls/Play/PauseIcon';
import PlayIcon from 'styles/icons/player/Controls/Play/PlayIcon';
import StopIcon from 'styles/icons/player/Controls/Play/StopIcon';
import usePlayerActions from 'components/Player/PlayerActions/usePlayerActions';
import usePlayerColor from 'contexts/PlayerColor/usePlayerColor';
import usePlayerState from 'contexts/PlayerState/usePlayerState';
import { checkForRegGate } from 'components/Player/PlayerActions/shims';
import { PlaybackState, StationType } from '../../types';
import { useAdsPlayer, useAdsPlayerState } from 'ads';
import { useCallback } from 'react';
import { whatShouldPlayButtonShow } from 'components/Player/helpers';

function Play() {
  const actions = usePlayerActions();
  const state = usePlayerState();
  const { adIsPlaying, adIsPresent } = useAdsPlayerState();
  const playbackState = state?.playbackState as PlaybackState;
  const StopOrPauseIcon =
    state?.stationType === StationType.Live ? StopIcon : PauseIcon;
  const adsPlayer = useAdsPlayer();
  const { playerColor } = usePlayerColor();

  const onClick = useCallback(() => {
    if (
      state?.stationType &&
      !checkForRegGate(state?.stationType, state?.stationId)
    ) {
      if (adIsPresent) {
        adsPlayer?.pause(adIsPlaying);
      } else {
        actions.play(adsPlayer);
      }
    }
  }, [actions.play, adsPlayer, adIsPlaying, adIsPresent]);

  const { loadingAnimation, stopPauseIcon, playIcon } =
    whatShouldPlayButtonShow(adIsPlaying, adIsPresent, playbackState);

  return (
    <Button
      aria-label="Play Button"
      data-test="play-button"
      data-test-state={playbackState}
      onClick={onClick}
      type="button"
    >
      <>
        {loadingAnimation && <LoadingIcon />}
        {stopPauseIcon && <StopOrPauseIcon fill={playerColor} />}
        {playIcon && <PlayIcon fill={playerColor} />}
      </>
    </Button>
  );
}

export default Play;
