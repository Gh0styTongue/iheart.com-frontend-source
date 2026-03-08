import PlayButton from 'components/Player/PlayButtonContainer';
import styled from '@emotion/styled';

type Props = {
  trackImg?: string | null;
};

const StyledPlayButton = styled(PlayButton)<Props>(({ theme, trackImg }) => ({
  fill: theme.colors.black.dark,
  height: trackImg ? '50%' : '100%',
  margin: '0 auto',
  width: trackImg ? '50%' : '100%',
}));

export default StyledPlayButton;
