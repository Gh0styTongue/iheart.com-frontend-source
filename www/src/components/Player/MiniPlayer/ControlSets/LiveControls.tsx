import Controls from '../Controls';
import usePlayerState from 'contexts/PlayerState/usePlayerState';

type Props = {
  fullscreen?: boolean;
};

function LiveControls({ fullscreen }: Props) {
  const state = usePlayerState();

  return (
    <Controls fullscreen={fullscreen}>
      <Controls.AddToPlaylist />
      <Controls.Replay />
      <Controls.Play />
      {!!state?.isReplay && <Controls.Next />}
    </Controls>
  );
}

export default LiveControls;
