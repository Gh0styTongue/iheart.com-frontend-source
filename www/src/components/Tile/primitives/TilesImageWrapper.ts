import styled from '@emotion/styled';

type Props = {
  liveTile?: boolean;
};

const TilesImageWrapper = styled('div')<Props>(
  ({ liveTile = false, theme }) => ({
    backgroundColor: liveTile ? theme.colors.white.primary : 'none',

    '.image img': {
      border: liveTile ? `0.1rem solid ${theme.colors.gray.light}` : 'none',
      padding: liveTile ? '1.5rem' : 0,
    },

    '.image .background': {
      backgroundPosition: 'center',
      backgroundSize: 'cover',
    },
  }),
);

export default TilesImageWrapper;
