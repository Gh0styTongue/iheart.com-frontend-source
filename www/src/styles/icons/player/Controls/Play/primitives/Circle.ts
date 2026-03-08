import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

const loading = keyframes({
  '0%, 25%': {
    strokeDashoffset: 68,
    transform: 'rotateZ(0deg)',
  },
  '50%, 75%': {
    strokeDashoffset: 19,
    transform: 'rotateZ(45deg)',
  },
  '100%': {
    strokeDashoffset: 68,
    transform: 'rotateZ(360deg)',
  },
});

type Props = {
  fillColor?: string;
  strokeColor?: string;
};

const Circle = styled('circle')<Props>(
  ({ fillColor, strokeColor, strokeWidth = 3, theme }) => ({
    animationDuration: '2s',
    animationFillMode: 'both',
    animationIterationCount: 'infinite',
    animationName: loading,
    animationTimingFunction: 'ease-in-out',
    fill: fillColor ?? theme.colors.transparent.primary,
    stroke: strokeColor ?? theme.colors.gray['300'],
    strokeDasharray: 70,
    strokeLinecap: 'round',
    strokeWidth,
    transformOrigin: '50% 50%',
    willChange: 'strokeDashoffset, transform',
  }),
);

export default Circle;
