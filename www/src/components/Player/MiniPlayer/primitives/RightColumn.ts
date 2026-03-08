import Controls from '../Controls';
import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const RightColumn = styled('div')(({ theme }) => ({
  alignItems: 'flex-end',
  justifyContent: 'center',
  display: 'flex',
  flexDirection: 'column',

  [mediaQueryBuilder(theme.mediaQueries.max.width[768])]: {
    [`${Controls.ControlSet} > *:not([aria-label="Expand Button"])`]: {
      display: 'none',
    },
  },
}));

export default RightColumn;
