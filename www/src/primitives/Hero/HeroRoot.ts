import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const HeroRoot = styled.section(({ theme }) => ({
  height: theme.dimensions.heroHeight,
  overflow: 'hidden',
  position: 'relative',
  transform: 'translateZ(0)',
  transition: 'top 0.2s ease-out',
  width: '100%',

  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    height: theme.dimensions.heroHeightTablet,
    zIndex: 2,
  },
}));

export default HeroRoot;
