import AutoSizer from 'react-virtualized-auto-sizer';
import createTile from './createTile';
import dimensions from 'styles/dimensions';
import getPxFromRemStr from './getPxFromRemStr';
import InfiniteLoader from 'react-window-infinite-loader';
import useTilesInRow from './useTilesInRow';
import { CSSProperties, LegacyRef } from 'react';
import {
  VariableSizeList as List,
  ListOnItemsRenderedProps,
} from 'react-window';
import { SwipeTileContainer as TileContainer } from './primitives';
import type { SwipeTilesProps } from './types';

const TILE_GUTTER = 14; // 1.4rem = 14 px
const PAGE_GUTTER_PX = getPxFromRemStr(dimensions.gutter);

export default function SwipeTiles({
  aspectRatio = 1,
  defaultTileInfoHeight,
  isItemLoaded,
  itemCount,
  layoutMobile = 'horizontal',
  loadMoreItems,
  tileInfoHeight = 0,
  tilesData = [],
  tilesInRow: maxTilesInRow,
}: SwipeTilesProps) {
  const tilesInRow = useTilesInRow(maxTilesInRow);

  const Tiles = (props: { index: number; style: CSSProperties }) => {
    const { index, style: libStyle } = props;
    const style: CSSProperties = {
      ...libStyle,
      // in order to add a left margin to the list of Tiles, we need to add the margin
      // to the first item. this decreases the width available to display the first
      // tile. this width is added back to the first item in getItemSize()
      marginLeft: index === 0 ? dimensions.gutter : undefined,
      width:
        Number(libStyle.width) -
        TILE_GUTTER -
        (index === 0 ? PAGE_GUTTER_PX : 0),
    };
    const tileData = tilesData[index];
    return createTile({
      ...(tileData || { key: index, tilesInRow }),
      isDummyTile: !tileData,
      style,
      TileContainer,
    });
  };

  const getItemSize = (index: number, itemWidth: number) => {
    // this increases the width of the first item by the amount of
    // margin added above
    const listLeftPadding = index === 0 ? PAGE_GUTTER_PX : 0;
    return itemWidth + TILE_GUTTER + listLeftPadding;
  };

  const createTilesLoader = ({
    itemHeight,
    itemWidth,
    width,
  }: {
    itemHeight: number;
    itemWidth: number;
    width: number;
  }) => {
    // returns the loading function expected by React-Window Infinite Loader,
    // and `onItemsRendered` & `ref` are provided by InfiniteLoader
    return ({
      onItemsRendered,
      ref,
    }: {
      onItemsRendered?: (props: ListOnItemsRenderedProps) => any;
      ref?: LegacyRef<List<any>>;
    } = {}) => (
      <List
        height={itemHeight + tileInfoHeight}
        itemCount={itemCount}
        itemSize={index => getItemSize(index, itemWidth)}
        layout={layoutMobile}
        onItemsRendered={onItemsRendered}
        ref={ref}
        style={{ overflow: 'auto hidden' }}
        width={width}
      >
        {Tiles}
      </List>
    );
  };

  // height: 23rem -- fixed size based on displaying 2 tiles (w 1 title & 2 subtitle lines) + peek on iphone x
  // defining height here prevents content shift from react-window absolute positioning
  return (
    <div
      css={{
        height: `${23 - (defaultTileInfoHeight - tileInfoHeight) / 10}rem`,
        margin: `0 -${dimensions.gutter}`,
      }}
    >
      <AutoSizer>
        {({ height, width }: { height: number; width: number }) => {
          const itemHeight = height - tileInfoHeight;
          const itemWidth = itemHeight * aspectRatio;
          const tilesLoader = createTilesLoader({
            itemHeight,
            itemWidth,
            width,
          });

          return loadMoreItems && isItemLoaded ?
              <InfiniteLoader
                isItemLoaded={isItemLoaded}
                itemCount={itemCount}
                loadMoreItems={loadMoreItems}
              >
                {/* tiles are loaded by Infinite Loader */}
                {tilesLoader}
              </InfiniteLoader>
              // load tiles immediately if they are already available (ie, no `loadMoreItems` service call)
            : tilesLoader();
        }}
      </AutoSizer>
    </div>
  );
}
