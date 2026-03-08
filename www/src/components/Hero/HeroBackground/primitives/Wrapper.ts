import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

type Props = {
  backgroundColor?: string;
};

const Wrapper = styled('div')<Props>(({ backgroundColor, theme }) => ({
  backgroundColor: backgroundColor || theme.colors.gray.dark,
  height: theme.dimensions.heroHeight,
  overflow: 'hidden',
  transitionProperty: 'background-color',
  width: '100%',

  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    height: theme.dimensions.heroContentHeightTablet,
  },
}));

export default Wrapper;
