import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const Container = styled('div')(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  height: '2.1rem',
  width: '100%',

  [mediaQueryBuilder(theme.mediaQueries.max.width['400'])]: {
    margin: '-8rem 0 8rem',
  },
}));

export default Container;
