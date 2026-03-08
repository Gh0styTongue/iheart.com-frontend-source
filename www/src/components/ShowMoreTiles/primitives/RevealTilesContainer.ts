import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';
import { createGetTilesInRow } from '../useTilesInRow';

type Props = {
  tilesInRow: number;
};

const RevealTilesContainer = styled('ul')<Props>(({
  tilesInRow = 4,
  theme,
}) => {
  const columnGapXS = 1.4;
  const getTilesInRow = createGetTilesInRow(tilesInRow);

  return {
    columnGap: theme.dimensions.pageGutter,
    display: 'grid',
    gridTemplateColumns: `repeat(${tilesInRow}, 1fr)`,
    listStyleType: 'none',
    margin: '0',
    padding: '0',

    [mediaQueryBuilder(theme.mediaQueries.max.width['1024'])]: {
      columnGap: `${columnGapXS}rem`,
      gridTemplateColumns: `repeat(${getTilesInRow(1024)}, 1fr)`,
    },

    [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
      gridTemplateColumns: `repeat(${getTilesInRow(768)}, 1fr)`,
    },

    [mediaQueryBuilder(theme.mediaQueries.max.width['599'])]: {
      gridTemplateColumns: `repeat(${getTilesInRow(599)}, 1fr)`,
      marginBottom: '1rem',
    },

    [mediaQueryBuilder(theme.mediaQueries.max.width['420'])]: {
      gridTemplateColumns: `repeat(${getTilesInRow(420)}, 1fr)`,
    },

    [mediaQueryBuilder(theme.mediaQueries.max.width['320'])]: {
      gridTemplateColumns: `repeat(${getTilesInRow(320)}, 1fr)`,
    },
  };
});

export default RevealTilesContainer;
