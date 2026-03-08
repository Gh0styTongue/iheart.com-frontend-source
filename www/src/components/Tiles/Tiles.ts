import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';
import { createGetGridTemplateColumns } from './helpers';

type Props = {
  horizontalScroll?: boolean;
  noTileOnMobile?: boolean;
  tilesInRow?: number;
};

const Tiles = styled('ul')<Props>(({
  horizontalScroll = false,
  noTileOnMobile = false,
  tilesInRow = 4,
  theme,
}) => {
  const columnGapXS = 1.4;
  const getGridTemplateColumns = createGetGridTemplateColumns({
    columnGapXS,
    horizontalScroll,
    noTileOnMobile,
    tilesInRow,
  });

  return {
    columnGap: theme.dimensions.pageGutter,
    display: 'grid',
    gridTemplateColumns: getGridTemplateColumns(),
    listStyleType: 'none',
    margin: '0',
    padding: '0',

    [mediaQueryBuilder(theme.mediaQueries.max.width['1024'])]: {
      gridTemplateColumns: getGridTemplateColumns(1024),
    },

    [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
      gridTemplateColumns: getGridTemplateColumns(768),
      overflowX: horizontalScroll ? 'scroll' : 'hidden',
    },

    [mediaQueryBuilder(theme.mediaQueries.max.width['599'])]: {
      gridTemplateColumns: getGridTemplateColumns(599),
      marginBottom: '1rem',
    },

    [mediaQueryBuilder(theme.mediaQueries.max.width['420'])]: {
      gridTemplateColumns: getGridTemplateColumns(420),
    },

    [mediaQueryBuilder(theme.mediaQueries.max.width['320'])]: {
      gridTemplateColumns: getGridTemplateColumns(320),
    },
  };
});

export default Tiles;
