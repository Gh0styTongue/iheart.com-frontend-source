import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const CenterColumn = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',

  [mediaQueryBuilder(theme.mediaQueries.max.width[768])]: {
    display: 'none',
  },
}));

export default CenterColumn;
