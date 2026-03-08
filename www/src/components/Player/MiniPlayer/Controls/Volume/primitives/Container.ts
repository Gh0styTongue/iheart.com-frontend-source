import Slider from '../../Slider/primitives/Container';
import styled from '@emotion/styled';

const Container = styled('div')({
  display: 'flex',
  position: 'relative',

  [`& > ${Slider}`]: {
    left: 'calc(100% + 0.5rem)',
    margin: 0,
    opacity: 0,
    position: 'absolute',
    top: '0.1rem',
    width: '6.5rem',
  },

  [`&:hover > ${Slider}`]: {
    opacity: 1,
  },
});

export default Container;
