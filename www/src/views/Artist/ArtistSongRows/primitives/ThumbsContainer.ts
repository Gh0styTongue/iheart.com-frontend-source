import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const ThumbsContainer = styled('div')(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',

  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    display: 'none',
    marginLeft: '2rem',
  },
}));

export default ThumbsContainer;
