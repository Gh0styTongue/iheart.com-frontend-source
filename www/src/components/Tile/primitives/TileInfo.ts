import styled from '@emotion/styled';

type Props = {
  hasBottomMargin?: boolean;
};

const TileInfo = styled('div')<Props>(({ hasBottomMargin = true }) => ({
  marginBottom: hasBottomMargin ? '2.3rem' : '0.3rem',
  overflow: 'hidden',
  position: 'relative',
  textAlign: 'center',
}));

export default TileInfo;
