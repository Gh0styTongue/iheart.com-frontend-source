import Tile from 'components/Tile/Tile';
import type { TileData } from './types';

const createTile = ({
  children,
  dataTest,
  dropdown,
  hasBottomMargin,
  isDummyTile,
  itemSelected,
  key,
  singleRow,
  style,
  subTitle,
  TileContainer,
  tilesInRow,
  title,
  titleSingleLine,
  url,
}: TileData) => (
  <Tile
    dataTest={dataTest}
    dropdown={dropdown}
    hasBottomMargin={hasBottomMargin}
    isDummyTile={isDummyTile}
    itemSelected={itemSelected}
    key={key}
    singleRow={singleRow}
    style={style}
    subTitle={subTitle}
    TileContainer={TileContainer}
    tilesInRow={tilesInRow}
    title={title}
    titleSingleLine={titleSingleLine}
    url={url}
  >
    {children}
  </Tile>
);

export default createTile;
