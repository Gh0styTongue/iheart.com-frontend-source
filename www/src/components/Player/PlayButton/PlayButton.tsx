import pauseIcon from '!raw-loader!svgo-loader?svgoConfig!./pause.svg';
import playIcon from '!raw-loader!svgo-loader?svgoConfig!./play.svg';
import Root from './primitives/Root';
import stopIcon from '!raw-loader!svgo-loader?svgoConfig!./stop.svg';
import SVG from './primitives/SVG';
import theme from 'styles/themes/default';
import useTranslate from 'contexts/TranslateContext/useTranslate';
import type { PlaybackState } from 'components/Player/PlayerState/types';

type Props = {
  buttonState?: PlaybackState;
  className?: string;
  isPausable?: boolean;
  onClick: () => void;
  svgFillColor?: string;
};

export default function PlayButton({
  buttonState = 'PAUSED',
  className = '',
  isPausable = false,
  onClick,
  svgFillColor = theme.colors.white.primary,
}: Props) {
  const translate = useTranslate();
  const isBuffering = buttonState === 'LOADING' || buttonState === 'BUFFERING';
  const isPlaying = buttonState === 'PLAYING';
  const stopButton = isPausable ? pauseIcon : stopIcon;
  const svgFile = isPlaying || isBuffering ? stopButton : playIcon;
  const stopLabel = isPausable ? translate('Pause') : translate('Stop');

  let testStateLabel = 'paused';
  if (isBuffering) testStateLabel = 'buffering';
  if (isPlaying) testStateLabel = 'playing';

  return (
    <Root
      className={className}
      data-test="play-button"
      data-test-state={testStateLabel}
      isBuffering={isBuffering}
      isPlaying={isPlaying}
      onClick={onClick}
      type="button"
    >
      <SVG
        aria-label={isPlaying || isBuffering ? stopLabel : translate('Play')}
        cleanup
        fill={svgFillColor}
        svg={svgFile}
      />
    </Root>
  );
}
