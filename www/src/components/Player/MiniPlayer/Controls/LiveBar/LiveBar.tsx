import Container from '../SeekBar/primitives/Container';
import Slider from '../Slider';
import useTheme from 'contexts/Theme/useTheme';

function LiveBar() {
  const theme = useTheme();

  return (
    <Container style={{ marginBottom: '2rem' }}>
      <Slider
        color={theme.colors.red[500]}
        max={0}
        readonly
        text="live"
        value={0}
      />
    </Container>
  );
}

export default LiveBar;
