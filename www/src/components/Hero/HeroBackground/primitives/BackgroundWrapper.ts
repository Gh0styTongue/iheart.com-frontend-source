import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

type Props = {
  tabletBackground: boolean;
  tabletBackgroundStyles: boolean;
};

const BackgroundWrapper = styled('div')<Props>(
  ({ tabletBackground, tabletBackgroundStyles, theme }) => ({
    backgroundColor: tabletBackgroundStyles ? theme.colors.black.dark : 'auto',
    height: '100%',
    width: '100%',
    [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
      display: tabletBackground ? 'none' : 'block',
    },
    img: {
      objectFit: tabletBackgroundStyles ? 'cover' : 'inherit',
      opacity: tabletBackgroundStyles ? '0.6' : 1,
      transitionTimingFunction:
        tabletBackgroundStyles ? 'cubic-bezier(0.7, 0, 0.3, 1)' : 'inherit',
    },
  }),
);

export default BackgroundWrapper;
