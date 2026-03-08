import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const DirectorySubheader = styled.div(({ theme }) => ({
  color: theme.colors.gray.medium,
  float: 'left',
  fontSize: theme.fonts.size.small,
  lineHeight: '2rem',
  margin: '0.25rem 0 2rem',
  width: '60%',

  a: {
    color: theme.colors.gray.medium,
  },

  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    float: 'none',
    width: '100%',
  },
}));

export default DirectorySubheader;
