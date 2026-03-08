import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const Year = styled('div')(({ theme }) => ({
  boxSizing: 'border-box',
  flex: '0 0 auto',
  flexBasis: '25%',
  maxWidth: '25%',

  [mediaQueryBuilder(theme.mediaQueries.max.width['370'])]: {
    flexBasis: '100%',
    maxWidth: '100%',
  },

  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    flexBasis: 'initial',
    maxWidth: 'none',
    width: '100%',
  },

  p: {
    color: theme.colors.gray.medium,
    marginBottom: '1rem',
    textAlign: 'left',
  },
}));

export default Year;
