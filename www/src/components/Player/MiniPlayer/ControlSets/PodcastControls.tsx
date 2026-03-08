import Controls from '../Controls';

type Props = {
  fullscreen?: boolean;
};

function PodcastControls({ fullscreen }: Props) {
  return (
    <Controls fullscreen={fullscreen}>
      <Controls.Speed />
      <Controls.Back15 />
      <Controls.Play />
      <Controls.Forward30 />
    </Controls>
  );
}

export default PodcastControls;
