import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const SubHeadline = styled('div')(({ theme }) => ({
  fontSize: '1.6rem',
  fontWeight: 'bold',
  marginTop: '-0.7rem',
  [mediaQueryBuilder(theme.mediaQueries.max.width['400'])]: {
    fontSize: '1.3rem',
  },
}));

export default SubHeadline;
