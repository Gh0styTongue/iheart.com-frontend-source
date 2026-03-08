import AddToPlaylist from './AddToPlaylist';
import Back15 from './Back15';
import Container from 'components/Player/primitives/Container';
import ControlSet from 'components/Player/primitives/ControlSet';
import Expand from './Expand';
import Forward30 from './Forward30';
import LiveBar from './LiveBar/LiveBar';
import Next from './Next';
import Overflow from './Overflow';
import Play from './Play';
import Previous from './Previous';
import Replay from './Replay';
import SeekBar from './SeekBar';
import ShouldShow from 'components/ShouldShow';
import Speed from './Speed';
import Thumbs from './Thumbs';
import usePlayerState from 'contexts/PlayerState/usePlayerState';
import Volume from './Volume';
import { StationType } from '../types';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  fullscreen?: boolean;
};

function Controls({ children, fullscreen = false }: Props) {
  const state = usePlayerState();

  return (
    <Container data-test="controls-container">
      <ShouldShow shouldShow={fullscreen}>
        <Thumbs className="fullscreen-thumbs" />
        <ShouldShow shouldShow={!!state?.hasSeekbar}>
          <SeekBar />
        </ShouldShow>
        <ShouldShow shouldShow={state?.stationType === StationType.Live}>
          <LiveBar />
        </ShouldShow>
      </ShouldShow>
      <ControlSet data-test="control-set">
        {children}
        <Volume />
      </ControlSet>
      {!fullscreen && !!state?.hasSeekbar && <SeekBar />}
    </Container>
  );
}

Controls.Back15 = Back15;
Controls.ControlSet = ControlSet;
Controls.Expand = Expand;
Controls.Forward30 = Forward30;
Controls.Next = Next;
Controls.Overflow = Overflow;
Controls.Play = Play;
Controls.Previous = Previous;
Controls.Replay = Replay;
Controls.AddToPlaylist = AddToPlaylist;
Controls.Speed = Speed;
Controls.Thumbs = Thumbs;

export default Controls;
