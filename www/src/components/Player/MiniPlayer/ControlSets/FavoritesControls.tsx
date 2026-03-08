import Controls from '../Controls';

type Props = {
  fullscreen?: boolean;
};

function FavoritesControls({ fullscreen }: Props) {
  return (
    <Controls fullscreen={fullscreen}>
      <Controls.AddToPlaylist />
      <Controls.Replay />
      <Controls.Play />
      <Controls.Next />
    </Controls>
  );
}

export default FavoritesControls;
