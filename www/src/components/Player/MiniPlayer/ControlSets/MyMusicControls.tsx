import Controls from '../Controls';

type Props = {
  fullscreen?: boolean;
};

function MyMusicControls({ fullscreen }: Props) {
  return (
    <Controls fullscreen={fullscreen}>
      <Controls.AddToPlaylist />
      <Controls.Previous />
      <Controls.Play />
      <Controls.Next />
    </Controls>
  );
}

export default MyMusicControls;
