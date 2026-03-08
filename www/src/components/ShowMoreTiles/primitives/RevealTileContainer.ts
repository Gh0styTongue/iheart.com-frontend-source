import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';
import SwipeTileContainer from './SwipeTileContainer';
import { createGetTilesInRow } from '../useTilesInRow';

type Props = {
  singleRow?: boolean;
  tilesInRow: number;
};

const RevealTileContainer = styled(SwipeTileContainer)<Props>(({
  singleRow,
  theme,
  tilesInRow,
}) => {
  const getTilesInRow = createGetTilesInRow(tilesInRow);

  return {
    listStyleType: 'none',
    [`:nth-of-type(${tilesInRow}) ~ *`]: {
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
        display: singleRow ? 'none' : undefined,
      },
    },

    [mediaQueryBuilder(theme.mediaQueries.max.width['420'])]: {
      [`:nth-of-type(${getTilesInRow(420)}) ~ *`]: {
        display: singleRow ? 'none' : undefined,
      },
    },

    [mediaQueryBuilder(theme.mediaQueries.max.width['320'])]: {
      [`:nth-of-type(${getTilesInRow(320)}) ~ *`]: {
        display: singleRow ? 'none' : undefined,
      },
    },
  };
});

export default RevealTileContainer;
