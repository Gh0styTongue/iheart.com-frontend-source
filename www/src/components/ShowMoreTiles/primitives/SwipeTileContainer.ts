import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';
import TileDropdown from 'components/Tile/primitives/TileDropdown';

type Props = {
  isTouch?: boolean;
  tileDelay?: number;
  tilePosition?: number;
};

const rotateTileDropdown = {
  cursor: 'pointer',
  opacity: 1,
  right: '-1rem',
  top: 0,
  svg: {
    transform: 'rotate(90deg)',
  },
};

const SwipeTileContainer = styled('div')<Props>(({
  isTouch,
  tileDelay = 0,
  tilePosition = 0,
  theme,
}) => {
  return {
    animation: `${theme.keyframes.fadeIn} 300ms ease-in-out`,
    animationDelay: `${(tileDelay + tilePosition) * 100}ms`,
    animationFillMode: 'forwards',
    opacity: 0,

    '.image:before': {
      backgroundImage: 'none',
    },

    [mediaQueryBuilder(theme.mediaQueries.max.width['599'])]: {
      [TileDropdown.toString()]: rotateTileDropdown,
    },

    // show/hide dropdown
    '&:hover': {
      [TileDropdown.toString()]: rotateTileDropdown,
    },

    // always show dropdown on touch devices
    [TileDropdown.toString()]: isTouch ? rotateTileDropdown : {},
  };
});

export default SwipeTileContainer;
