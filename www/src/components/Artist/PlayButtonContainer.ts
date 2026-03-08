import styled from '@emotion/styled';

const PlayButtonContainerPrimitive = styled('div')(({ theme }) => ({
  '&:hover': {
    '+ .image::after': {
      background: theme.colors.transparent.dark,
    },

    '+ span .image::after': {
      background: theme.colors.transparent.dark,
    },
  },

  '.play': {
    borderColor: theme.colors.white.primary,
    bottom: '30%',
    height: '40%',
    left: '30%',
    position: 'absolute',
    width: '40%',
    zIndex: 1,

    svg: {
      fill: theme.colors.white.primary,
    },
  },
}));

export default PlayButtonContainerPrimitive;
