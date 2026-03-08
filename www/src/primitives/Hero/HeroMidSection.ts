import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const HeroMidSection = styled.div(({ theme }) => ({
  backgroundColor: theme.colors.transparent.primary,
  color: theme.colors.white.primary,
  display: 'flex',
  flexDirection: 'row',
  height: '100%',
  left: 0,
  position: 'absolute',
  top: 0,
  width: '100%',

  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    height: theme.dimensions.heroContentHeightTablet,
  },
}));

export default HeroMidSection;
