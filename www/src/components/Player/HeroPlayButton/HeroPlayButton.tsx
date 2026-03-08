import Button from './primitives/Button';
import LoadingIcon from 'styles/icons/player/Controls/Play/LoadingIcon';
import PauseIcon from 'styles/icons/player/Controls/Play/PauseIcon';
import PlayIcon from 'styles/icons/player/Controls/Play/PlayIcon';
import StopIcon from 'styles/icons/player/Controls/Play/StopIcon';
import theme from 'styles/themes/default';
import { LIVE_TYPES } from 'constants/stationTypes';
import { PlaybackState } from 'components/Player/MiniPlayer/types';
import { whatShouldPlayButtonShow } from 'components/Player/helpers';
import type { AdsPlayerState } from 'ads/playback';
import type { StationType } from 'constants/stationTypes';

export default function HeroPlayButton({
  buttonState = PlaybackState.Paused,
  className = '',
  onClick,
  stationType,
  newHero,
  adsPlayerState: { adIsPlaying, adIsPresent },
}: {
  buttonState: PlaybackState;
  className: string;
  onClick: () => void;
  stationType: StationType;
  newHero: boolean;
  adsPlayerState: AdsPlayerState;
}) {
  const StopOrPauseIcon =
    LIVE_TYPES.includes(stationType) ? StopIcon : PauseIcon;

  const loadingColor =
    newHero ? theme.colors.gray[450] : theme.colors.white.primary;

  const gradientId = 'heroPlaybuttonAnimationGradient';

  const { loadingAnimation, stopPauseIcon, playIcon } =
    whatShouldPlayButtonShow(adIsPlaying, adIsPresent, buttonState);

  return (
    <Button
      aria-label="Play Button"
      className={className}
      data-test="play-button"
      data-test-state={buttonState}
      newHero={newHero}
      onClick={onClick}
      type="button"
    >
      <>
        <svg style={{ height: 0, width: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor={loadingColor} />
              <stop offset="25%" stopColor={loadingColor} />
              <stop offset="100%" stopColor={loadingColor} stopOpacity={0} />
            </linearGradient>
          </defs>
        </svg>
        {loadingAnimation && (
          <LoadingIcon
            size={theme.dimensions.heroPlayButton}
            stroke={`url(#${gradientId})`}
            strokeWidth={2}
          />
        )}
        {stopPauseIcon && (
          <StopOrPauseIcon size={theme.dimensions.heroPlayButton} />
        )}
        {playIcon && <PlayIcon size={theme.dimensions.heroPlayButton} />}
      </>
    </Button>
  );
}
