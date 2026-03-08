import safeStringify from 'utils/safeStringify';
import { addCategoryToState, addChildToParents, parseApiCard } from './helpers';
import { get, merge } from 'lodash-es';
import { State } from './types';

export function receivePlaylistTiles(
  state: State,
  { tiles }: { tiles: Array<any> },
) {
  return tiles
    .sort(({ position: positionA }, { position: positionB }) =>
      positionA <= positionB ? -1 : 1,
    )
    .map(parseApiCard)
    .filter(tile => get(tile, 'isPlaylist'))
    .reduce(
      (memo, tile) => ({
        ...memo,
        [safeStringify(get(tile, 'id'))]: tile,
      }),
      state,
    );
}

export function receiveCategories(
  state: State,
  { tiles }: { tiles: Array<any> },
) {
  const sortedTiles = tiles.sort(
    ({ position: positionA }, { position: positionB }) =>
      positionA <= positionB ? -1 : 1,
  );
  const inputTilesMap = sortedTiles
    .map(parseApiCard)
    .reduce(
      (memo, tile) => addChildToParents(addCategoryToState(memo, tile), tile),
      {},
    );

  return merge({}, state, inputTilesMap);
}
