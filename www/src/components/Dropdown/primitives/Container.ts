import styled from '@emotion/styled';
import TriggerWrapper from './TriggerWrapper';

const Container = styled('div')({
  display: 'inline-block',
  position: 'relative',
  verticalAlign: 'middle',

  '&:hover': {
    [TriggerWrapper.toString()]: {
      opacity: 1,
      pointerEvents: 'all',
    },
  },
});

export default Container;
