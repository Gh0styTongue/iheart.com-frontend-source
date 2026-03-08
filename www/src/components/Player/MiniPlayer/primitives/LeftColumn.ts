import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const LeftColumn = styled('div')(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  overflow: 'hidden',

  '[aria-label="Play Button"]': {
    display: 'none',

    [mediaQueryBuilder(theme.mediaQueries.max.width[768])]: {
      display: 'block',
    },
  },
}));

export default LeftColumn;
