import Button from 'components/Player/primitives/Button';
import Container from './primitives/Container';
import Handle from './primitives/Handle';
import LocalStorageKeys from 'constants/localStorageKeys';
import MuteIcon from 'styles/icons/player/Controls/Volume/MuteIcon';
import Slider from '../Slider';
import useLocalStorage from 'hooks/useLocalStorage';
import useMount from 'hooks/useMount';
import usePlayerColor from 'contexts/PlayerColor/usePlayerColor';
import VolumeIcon from 'styles/icons/player/Controls/Volume/VolumeIcon';
import { setVolume, toggleMute } from 'state/Playback/actions';
import { useDispatch, useSelector } from 'react-redux';
import type { State } from 'state/types';

type PersistedState = {
  mute: boolean;
  volume: number;
};

function Volume() {
  const [persistedState] = useLocalStorage<PersistedState | null>(
    LocalStorageKeys.PlayerState,
    null,
  );
  const dispatch = useDispatch();
  const muted = useSelector<State, boolean>(state => state.playback.muted);
  const volume = useSelector<State, number>(state => state.playback.volume);
  const { playerColor } = usePlayerColor();

  useMount(() => {
    if (persistedState) {
      if (persistedState.volume !== volume)
        dispatch(setVolume(persistedState.volume));
      if (persistedState.mute !== muted)
        dispatch(toggleMute(persistedState.mute));
    }
  });

  function mute(): void {
    dispatch(toggleMute());
  }

  function updateVolume(value: number): void {
    if (muted) mute();
    dispatch(setVolume(value));
  }

  return (
    <Container aria-label="Volume Container">
      <Button
        aria-label="Volume Button"
        data-test="volume-button"
        onClick={mute}
      >
        {muted ?
          <MuteIcon />
        : <VolumeIcon />}
      </Button>
      <Slider max={100} onChange={updateVolume} value={volume}>
        <Handle color={playerColor} />
      </Slider>
    </Container>
  );
}

export default Volume;
