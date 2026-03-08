import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const GrowlHeader = styled.header(({ theme }) => ({
  display: 'block',
  overflow: 'auto',
  'i, svg': {
    color: theme.colors.white.primary,
    fontSize: '3rem',
    maxWidth: '3rem',
    marginRight: '1rem',
    display: 'inline-block',
  },
  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    'i, svg': {
      fontSize: '4.5rem',
      marginBottom: '1.5rem',
      maxWidth: '4.5rem',
    },
  },
}));

export default GrowlHeader;
