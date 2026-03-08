import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

const rotate = keyframes({
  '100%': { transform: 'translate3d(-50%, -50%, 0) rotateZ(360deg)' },
});

const Spinner = styled('svg')(({ size = '4rem' }: { size?: string }) => ({
  animationDuration: '2s',
  animationIterationCount: 'infinite',
  animationName: rotate,
  animationTimingFunction: 'linear',
  borderRadius: '100%',
  height: size,
  left: '50%',
  position: 'absolute',
  top: '50%',
  transform: 'translate3d(-50%, -50%, 0) rotateZ(0)',
  transformOrigin: '50% 50%',
  width: size,
  willChange: 'transform',
}));

export default Spinner;
