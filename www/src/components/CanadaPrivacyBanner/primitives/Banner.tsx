import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

export const Banner = styled('div')(({ theme }) => ({
  backgroundColor: theme.colors.gray[600],
  display: 'flex',
  flexDirection: 'column',
  gap: '0.8rem',
  padding: '1.6rem',

  [mediaQueryBuilder(theme.mediaQueries.min.width['1024'])]: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: '3.2rem',
    justifyContent: 'center',
    padding: '3.2rem',
  },
}));

export default Banner;
