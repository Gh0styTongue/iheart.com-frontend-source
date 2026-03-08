import Container from './primitives/Container';
import formatSecondsIntoDuration from './formatSecondsIntoDuration';
import Handle from './primitives/Handle';
import Slider from '../Slider';
import Time from './primitives/Time';
import usePlayerActions from 'components/Player/PlayerActions/usePlayerActions';
import usePlayerColor from 'contexts/PlayerColor/usePlayerColor';
import usePlayerState from 'contexts/PlayerState/usePlayerState';
import usePlayerTime from 'contexts/PlayerTime/usePlayerTime';
import useTheme from 'contexts/Theme/useTheme';
import { useAdsPlayerState } from 'ads';

function Seekbar() {
  const actions = usePlayerActions();
  const state = usePlayerState();
  const { adTime, adIsPresent } = useAdsPlayerState();
  const theme = useTheme();
  const playerTime = usePlayerTime();
  const { playerColor } = usePlayerColor();

  let time = playerTime;

  if (adIsPresent && adTime) {
    time = adTime;
  }

  return (
    <Container>
      <Time
        aria-label="Seekbar Position"
        color={playerColor}
        data-test="seekbar-position"
      >
        {formatSecondsIntoDuration(time.position)}
      </Time>
      <Slider
        color={theme.colors.red[500]}
        max={time.duration}
        onChange={actions.seek}
        readonly={state?.seekbarReadOnly || !!(adTime && adIsPresent)}
        value={Math.max(0, time.position)}
      >
        <Handle aria-label="Seekbar Handle" />
      </Slider>
      <Time aria-label="Seekbar Duration" color={playerColor}>
        {formatSecondsIntoDuration(time.duration)}
      </Time>
    </Container>
  );
}

export default Seekbar;
