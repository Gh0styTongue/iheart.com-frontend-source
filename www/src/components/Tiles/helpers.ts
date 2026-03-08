type ColumnParams = {
  columnGapXS?: number;
  horizontalScroll?: boolean;
  noTileOnMobile?: boolean;
  tilesInRow: number;
};

export function createGetTilesInRow({
  horizontalScroll,
  noTileOnMobile,
  tilesInRow,
}: ColumnParams) {
  // noTileOnMobile, eg Your Library -- doesn't use Tile below 599 breakpoint
  const useTileOnMobile = tilesInRow > 4 ? tilesInRow - 2 : 2;

  return function getTilesInRow(breakpoint?: number) {
    // if we at screensizes larger than the first breakpoint, show all tiles
    if (!breakpoint) {
      return tilesInRow;
    }

    // else if horizontally scrolling, show one less tile than the max, for all
    // breakpoints below the largest screensize
    else if (horizontalScroll) {
      return tilesInRow - 1;
    }

    // otherwise, if not horizontally scrolling, keep showing less tiles per row
    else {
      const tilesInRowMap: {
        [key: number]: number;
      } = {
        1024: tilesInRow - 1,
        768: tilesInRow - 1,
        599: noTileOnMobile ? 1 : useTileOnMobile,
        420: noTileOnMobile ? 1 : 2,
        320: 1,
      };

      return tilesInRowMap[breakpoint];
    }
  };
}

function createGetTrackSize({
  columnGapXS = 0,
  horizontalScroll,
  tilesInRow,
}: ColumnParams) {
  return function getTrackSize(breakpoint?: number) {
    // default: tiles will take up equal parts of the available space
    const defaultTrackSize = '1fr';

    if (!breakpoint || !horizontalScroll) {
      return defaultTrackSize;
    }

    // if we're horizontally scrolling at small screen sizes, some tile(s)
    // should be off screen. percentage is based on how many should be visibile,
    // subtracting half the column-gap (grid padding), so no tile appears cut off
    else {
      const trackSizeMap: {
        [key: number]: string;
      } = {
        1024: defaultTrackSize,
        768: defaultTrackSize,
        599: defaultTrackSize,
        420: `calc(${100 / (tilesInRow - 2)}% - ${columnGapXS / 2}rem)`,
        320: `calc(100% - ${columnGapXS / 2}rem)`,
      };

      return trackSizeMap[breakpoint];
    }
  };
}

/**
 * Calculates the tile size (grid "track size") at different breakpoints based on
 * 1. the number of tiles to display (Tile/Tiles component kept in sync via
 *    createTilesInRowGetter)
 * 2. whether we should horizontally scroll at smaller breakpoints and
 * 3. the grid's column-gap.
 * @param breakpoint
 * @returns {string}
 */
export function createGetGridTemplateColumns({
  columnGapXS,
  horizontalScroll,
  noTileOnMobile,
  tilesInRow,
}: ColumnParams) {
  const getTilesInRow = createGetTilesInRow({
    horizontalScroll,
    noTileOnMobile,
    tilesInRow,
  });

  const getTrackSize = createGetTrackSize({
    columnGapXS,
    horizontalScroll,
    tilesInRow,
  });

  return function getGridTemplateColumns(breakpoint?: number) {
    return `repeat(${getTilesInRow(breakpoint)}, ${getTrackSize(breakpoint)})`;
  };
}
