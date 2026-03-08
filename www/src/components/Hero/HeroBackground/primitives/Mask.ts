import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const Mask = styled('div')(({ theme }) => ({
  background: 'rgba(24, 24, 24, 0.7)',
  height: '100%',
  left: 0,
  position: 'absolute',
  top: 0,
  width: '100%',

  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    height: theme.dimensions.heroContentHeightTablet,
  },
}));

export default Mask;
