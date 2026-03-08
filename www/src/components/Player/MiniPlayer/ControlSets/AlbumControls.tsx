import Controls from '../Controls';

type Props = {
  fullscreen?: boolean;
};

function AlbumControls({ fullscreen }: Props) {
  return (
    <Controls fullscreen={fullscreen}>
      <Controls.AddToPlaylist />
      <Controls.Previous />
      <Controls.Play />
      <Controls.Next />
    </Controls>
  );
}

export default AlbumControls;
