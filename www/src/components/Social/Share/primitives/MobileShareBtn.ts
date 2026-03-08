import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const MobileShareBtn = styled('span')(({ theme }) => ({
  a: {
    color: theme.colors.gray.medium,
  },

  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    display: 'block',
  },

  display: 'none',
  fontSize: '2.3rem',
}));

export default MobileShareBtn;
