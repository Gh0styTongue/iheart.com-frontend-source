import Content from './Content';
import styled from '@emotion/styled';

type Props = {
  extendDown?: boolean;
};

const TriggerWrapper = styled('span')<Props>(({ extendDown = false }) => ({
  display: 'flex',
  flexDirection: 'column',
  opacity: 0.6,

  '&:hover, &.cy-hover': {
    opacity: 1,

    [`& + ${Content.toString()}`]: {
      maxHeight: '100vh',
      maxWidth: '100vw',
      opacity: 1,
      overflow: 'initial',
      svg: {
        transform: `translateY(${extendDown ? '0.1rem' : '0'})`,
      },
    },
  },
}));

export default TriggerWrapper;
