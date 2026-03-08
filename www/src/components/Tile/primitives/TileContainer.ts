import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';
import TileDropdown from './TileDropdown';
import { createGetTilesInRow } from 'components/Tiles/helpers';

type Props = {
  horizontalScroll?: boolean;
  isTouch?: boolean;
  maxImageWidth?: string;
  noTileOnMobile?: boolean;
  singleRow?: boolean;
  tileDelay?: number;
  tilePosition?: number;
  tilesInRow?: number;
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

const TileContainer = styled('li')<Props>(({
  horizontalScroll,
  isTouch,
  maxImageWidth,
  noTileOnMobile,
  singleRow,
  tileDelay = 0,
  tilePosition = 0,
  tilesInRow = 4,
  theme,
}) => {
  const getTilesInRow = createGetTilesInRow({
    horizontalScroll,
    noTileOnMobile,
    tilesInRow,
  });

  return {
    animation: `${theme.keyframes.fadeIn} 300ms ease-in-out`,
    animationDelay: `${(tileDelay + tilePosition) * 100}ms`,
    animationFillMode: 'forwards',
    listStyleType: 'none',
    maxWidth: maxImageWidth || 'auto',
    opacity: 0,

    '.image:before': {
      backgroundImage: 'none',
    },
    [`:nth-of-type(${getTilesInRow()}) ~ *`]: {
      display: singleRow ? 'none' : undefined,
    },

    [mediaQueryBuilder(theme.mediaQueries.max.width['1024'])]: {
      [`:nth-of-type(${getTilesInRow(1024)}) ~ *`]: {
        display: singleRow ? 'none' : undefined,
      },
    },

    [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
      [`:nth-of-type(${getTilesInRow(768)}) ~ *`]: {
        display: singleRow ? 'none' : undefined,
      },
    },

    [mediaQueryBuilder(theme.mediaQueries.max.width['599'])]: {
      [`:nth-of-type(${getTilesInRow(599)}) ~ *`]: {
        display: noTileOnMobile || singleRow ? 'none' : undefined,
      },
      display: noTileOnMobile ? 'none' : undefined,
      [TileDropdown.toString()]: rotateTileDropdown,
    },

    [mediaQueryBuilder(theme.mediaQueries.max.width['420'])]: {
      [`:nth-of-type(${getTilesInRow(420)}) ~ *`]: {
        display: noTileOnMobile || singleRow ? 'none' : undefined,
      },
      display: noTileOnMobile ? 'none' : undefined,
    },

    // no hiding additional tiles at 320 breakpoint as we still show 2, they just wrap

    // show/hide dropdown
    '&:hover': {
      [TileDropdown.toString()]: rotateTileDropdown,
    },

    // always show dropdown on touch devices
    [TileDropdown.toString()]: isTouch ? rotateTileDropdown : {},
  };
});

export default TileContainer;
