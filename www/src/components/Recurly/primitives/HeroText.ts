import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const HeroText = styled('h2')(({ theme }) => ({
  alignItems: 'center',
  color: theme.colors.white.primary,
  display: 'flex',
  fontSize: '3.2rem',
  fontWeight: 'bold',
  justifyContent: 'center',
  letterSpacing: '-0.5px',
  lineHeight: '3.8rem',
  textAlign: 'center',

  [mediaQueryBuilder(theme.mediaQueries.max.width['1160'])]: {
    fontSize: '3.2rem',
  },

  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    color: theme.colors.gray.dark,
    fontSize: '2rem',
  },

  [mediaQueryBuilder(theme.mediaQueries.max.width['640'])]: {
    fontSize: '2rem',
    lineHeight: '2.5rem',
  },
}));

export default HeroText;
