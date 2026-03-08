import styled from '@emotion/styled';

type Props = {
  isWideTile?: boolean;
};
const TileTitle = styled('div')<Props>(({ isWideTile = false, theme }) => ({
  color: theme.colors.black.secondary,
  fontSize: '1.5rem',
  marginTop: '0.9rem',
  padding: isWideTile ? '0 0.3em' : '0 1.5em',
  a: {
    color: theme.colors.black.secondary,
    textDecoration: 'none',

    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

export default TileTitle;
