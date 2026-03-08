import styled from '@emotion/styled';

type Props = {
  extendDown?: boolean;
};

const ARROW_OFFSET = '1rem';
const VERTICAL_DISTANCE = `calc(100% - 1rem + ${ARROW_OFFSET})`; // 1rem is arrow height

const Content = styled('div')<Props>(({ extendDown = false }) => ({
  alignItems: 'flex-end',
  bottom: extendDown ? 'auto' : VERTICAL_DISTANCE,
  display: 'flex',
  flexDirection: extendDown ? 'column-reverse' : 'column',
  maxHeight: 0,
  maxWidth: 0,
  opacity: 0,
  overflow: 'hidden',
  position: 'absolute',
  right: `calc(-${ARROW_OFFSET} - 0.1rem)`,
  top: extendDown ? VERTICAL_DISTANCE : 'auto',

  '&:hover': {
    maxHeight: '100vh',
    maxWidth: '100vw',
    opacity: 1,
    overflow: 'initial',
    svg: {
      transform: `translateY(${extendDown ? '0.1rem' : '0'})`,
    },
  },
}));

export default Content;
