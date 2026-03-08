import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import rgbaBuilder from 'styles/helpers/colors/rgbaBuilder';
import styled from '@emotion/styled';

const Container = styled('div')(({ theme }) => ({
  backgroundColor: theme.colors.white.primary,
  boxShadow: `0px -1px 3px ${rgbaBuilder(theme.colors.black.dark, 0.15)}`,
  color: theme.colors.gray[600],
  display: 'flex',
  height: '7.5rem',
  paddingRight: '1.6rem',
  position: 'relative',
  width: '100%',

  [mediaQueryBuilder(theme.mediaQueries.max.width[768])]: {
    padding: '0 1.6rem',
  },

  '& > div': {
    width: 'calc(100vw / 3)',

    [mediaQueryBuilder(theme.mediaQueries.max.width[768])]: {
      '&:first-of-type': { width: '75vw' },
      '&:last-of-type': { width: '25vw' },
    },
  },
}));

export default Container;
