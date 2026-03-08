import colors from 'styles/colors';
import rgba from 'styles/helpers/colors/rgbaBuilder';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

type Props = {
  isBuffering: boolean;
  isPlaying: boolean;
};

const Root = styled('button')<Props>(({ isBuffering, isPlaying }) => ({
  '&:focus': {
    outline: 'none',
  },

  '&:hover': {
    borderColor: rgba(colors.gray.light!, 0.25),
  },

  backgroundColor: colors.transparent.primary,
  border: `1px solid ${colors.gray.light}`,
  borderRadius: '100%',
  cursor: 'pointer',
  padding: 0,
  position: 'relative',
  transition: 'border-color 0.1s ease-in-out',
  transitionTimingFunction: 'cubic-bezier(0.7, 0, 0.3, 1)',
  svg: {
    left: '64%',
  },

  ...(isBuffering ?
    {
      '&::before': {
        animationDuration: '0.75s',
        animationIterationCount: 'infinite',
        animationName: spin,
        animationTimingFunction: 'linear',
        borderRadius: '50%',
        boxShadow: `0px 0px 0px ${colors.white.primary}, 0px 1px 0px ${rgba(
          colors.white.primary!,
          0.9,
        )}`,
        content: `''`,
        height: 'calc(100% - 2px)',
        left: '1px',
        position: 'absolute',
        top: '1px',
        width: 'calc(100% - 2px)',
      },

      borderColor: rgba(colors.gray.light!, 0.25),
    }
  : {}),

  ...(isBuffering || isPlaying ?
    {}
  : {
      svg: {
        left: '74%',
      },
    }),
}));

export default Root;
