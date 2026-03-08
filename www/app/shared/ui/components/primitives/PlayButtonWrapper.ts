import styled from '@emotion/styled';

const PlayButtonWrapper = styled('div')(({ theme }) => ({
  button: {
    bottom: 0,
    fill: theme.colors.white.primary,
    height: '50%',
    left: 0,
    margin: 'auto',
    padding: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: '50%',
    zIndex: 1,
  },
}));

export default PlayButtonWrapper;
