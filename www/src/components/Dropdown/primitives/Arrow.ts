import styled from '@emotion/styled';

type Props = {
  pointUp?: boolean;
};

const Arrow = styled('span')<Props>(({ pointUp = false }) => ({
  clear: 'both',
  display: 'block',
  float: 'right',
  height: '1.1rem',
  paddingLeft: '1.5rem',
  paddingRight: '1rem', // arrow width (2rem) - arrow offset (1rem)
  position: 'relative',
  zIndex: 4,
  svg: {
    bottom: 'auto',
    display: 'block',
    position: 'relative',
    transform: `translateY(${pointUp ? '0.5rem' : '-0.5rem'})`,
    transition: 'all 0.1s cubic-bezier(0.3, 0, 0, 1.1)',
    width: '2rem',
  },
}));

export default Arrow;
