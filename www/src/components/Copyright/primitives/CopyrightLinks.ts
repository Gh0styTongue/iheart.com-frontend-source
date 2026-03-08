import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const CopyrightLinks = styled('ul')(({ theme }) => ({
  float: 'left',
  margin: 0,
  padding: 0,

  [mediaQueryBuilder(theme.mediaQueries.min.width['768'])]: {
    float: 'right',
  },

  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    float: 'none',
  },
}));

export default CopyrightLinks;
