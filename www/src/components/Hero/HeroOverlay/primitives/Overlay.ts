import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

type Props = { darkBackground?: boolean };
const HeroOverlay = styled('section')<Props>(
  ({ darkBackground = true, theme }) => ({
    backgroundColor: darkBackground ? theme.colors.transparent.dark : 'auto',
    color: theme.colors.white.primary,
    flexDirection: 'column',
    height: '100%',
    left: 0,
    position: 'absolute',
    top: 0,
    width: '100%',

    [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
      height: theme.dimensions.heroContentHeightTablet,
    },
  }),
);

export default HeroOverlay;
