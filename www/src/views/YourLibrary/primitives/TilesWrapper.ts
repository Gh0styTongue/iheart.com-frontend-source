import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const TilesWrapper = styled('div')(({ theme }) => ({
  animation: `${theme.keyframes.fadeIn} 300ms ease-in-out, ${theme.keyframes.translateUp} 300ms ease-in-out`,
  animationFillMode: 'forwards',
  opacity: 0,

  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    marginBottom: 0,
  },
}));

export default TilesWrapper;
