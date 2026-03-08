import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const HeroTitle = styled.h1(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  fontSize: '3.6rem',
  fontWeight: 'bold',
  lineHeight: '4rem',
  marginBottom: '0.5rem',
  maxWidth: 'calc(100% - 1rem)',

  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    fontSize: '1.6rem',
    lineHeight: '1.8rem',
    marginBottom: '0',
  },

  [mediaQueryBuilder(theme.mediaQueries.max.width['370'])]: {
    fontSize: '1.4rem',
  },
}));

export default HeroTitle;
