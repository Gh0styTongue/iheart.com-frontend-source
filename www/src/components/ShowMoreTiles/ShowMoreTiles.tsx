import RevealTiles from './RevealTiles';
import SwipeTiles from './SwipeTiles';
import { getIsMobile } from 'state/Environment/selectors';
import { useSelector } from 'react-redux';
import type { ShowMoreTilesProps } from './types';

export default function ShowMoreTiles({
  aspectRatio,
  displayLimit = Infinity,
  isItemLoaded,
  layoutMobile,
  loadMoreItems,
  subtitleLines = 0,
  tilesData,
  tilesInRow = 4,
  titleLines = 0,
}: ShowMoreTilesProps) {
  const isMobile = useSelector(getIsMobile);
  const itemCount = Math.min(displayLimit, tilesData.length);

  // height estimates based on values in Tile/primitives/TileTitle & SubTitle:
  // margin + numLines * line-height
  const estimateTileInfoHeight = (
    numTitleLines: number,
    numSubtitleLines: number,
  ) => {
    const titleHeightEstimate = numTitleLines ? 9 + numTitleLines * 17 : 0;
    const subtitleHeightEstimate =
      numSubtitleLines ? 5 + numSubtitleLines * (titleLines ? 18 : 20) : 0;
    // 15 for extra bottom padding to clear horizontal scrollbar
    return titleHeightEstimate + subtitleHeightEstimate + 15;
  };
  const tileInfoHeight = estimateTileInfoHeight(titleLines, subtitleLines);
  const defaultTileInfoHeight = estimateTileInfoHeight(1, 2);

  return isMobile ?
      <SwipeTiles
        aspectRatio={aspectRatio}
        defaultTileInfoHeight={defaultTileInfoHeight}
        isItemLoaded={isItemLoaded}
        itemCount={itemCount}
        layoutMobile={layoutMobile}
        loadMoreItems={loadMoreItems}
        tileInfoHeight={tileInfoHeight}
        tilesData={tilesData}
        tilesInRow={tilesInRow}
      />
    : <RevealTiles
        isItemLoaded={isItemLoaded}
        itemCount={itemCount}
        loadMoreItems={loadMoreItems}
        tilesData={tilesData}
        tilesInRow={tilesInRow}
      />;
}
