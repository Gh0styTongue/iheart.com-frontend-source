import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const Wrapper = styled('div')(({ theme }) => ({
  display: 'inline-block',
  paddingBottom: theme.dimensions.gutter,
  verticalAlign: 'top',
  width: `calc(50% - ${theme.dimensions.gutter})`,
  '&:nth-of-type(2n + 1)': {
    marginRight: theme.dimensions.gutter,
  },
  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    width: '100%',
    '&:nth-of-type(2n + 1)': {
      marginRight: 0,
    },
  },
}));

export default Wrapper;
