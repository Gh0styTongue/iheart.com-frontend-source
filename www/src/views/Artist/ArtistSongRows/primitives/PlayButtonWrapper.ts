import rgba from 'styles/helpers/colors/rgbaBuilder';
import styled from '@emotion/styled';

type Props = {
  hasImage?: boolean;
};

const PlayButtonWrapper = styled('div')<Props>(
  ({ hasImage = false, theme }) => ({
    alignItems: 'center',
    background:
      hasImage ? rgba(theme.colors.gray[200], 0.7) : theme.colors.gray[100],
    bottom: 0,
    display: 'flex',
    fill: theme.colors.black.dark,
    justifyContent: 'center',
    left: 0,
    opacity: 0,
    position: 'absolute',
    right: 0,
    top: 0,

    '&:hover': {
      opacity: 1,
    },
  }),
);

export default PlayButtonWrapper;
