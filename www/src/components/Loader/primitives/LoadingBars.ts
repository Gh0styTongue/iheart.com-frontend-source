import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

const pulse = keyframes({
  '0%, 75%': {
    transform: 'scale(1, 1)',
  },
  '25%': {
    transform: 'scale(1, 3)',
  },
});

const LoadingBars = styled('div')({
  textAlign: 'center',
  '& > div': {
    '&:nth-of-type(1)': {
      animationDelay: '0s',
    },
    '&:nth-of-type(2)': {
      animationDelay: '0.2s',
    },
    '&:nth-of-type(3)': {
      animationDelay: '0.4s',
    },
    '&:nth-of-type(4)': {
      animationDelay: '0.6s',
    },
    '&:nth-of-type(5)': {
      animationDelay: '0.8s',
    },
    animation: `${pulse} 1.2s infinite ease-out`,
    background: 'rgba(0, 0, 0, 0.1)',
    display: 'inline-block',
    height: '3rem',
    margin: '0 2px',
    width: '1rem',
  },
});

export default LoadingBars;
