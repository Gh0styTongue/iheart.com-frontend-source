import Tile from 'components/Tile/Tile';
import { ReactNode } from 'react';
import { TILES_IN_ROW } from './constants';

type Props = {
  allRoundTiles?: boolean;
  noRoundTiles?: boolean;
  numTiles?: number;
};

function DummyTiles({
  allRoundTiles = false,
  numTiles = 12,
  noRoundTiles = false,
}: Props): Array<ReactNode> {
  const tiles = [];
  for (let i = 0; i < numTiles; i += 1) {
    let isRoundImage = false;
    if (!noRoundTiles) {
      isRoundImage = allRoundTiles || Math.round(Math.random()) === 1;
    }
    tiles.push(
      <Tile
        isDummyTile
        isRoundImage={isRoundImage}
        key={i}
        tilePosition={i}
        tilesInRow={TILES_IN_ROW}
      />,
    );
  }
  return tiles;
}

export default DummyTiles;
