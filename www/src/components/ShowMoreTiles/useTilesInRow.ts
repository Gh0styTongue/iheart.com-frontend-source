import useMount from 'hooks/useMount';
import { throttle } from 'lodash-es';
import { useState } from 'react';

export const createGetTilesInRow =
  (tilesInRow: number) => (windowWidth: number) => {
    if (windowWidth <= 320) return 1;
    if (windowWidth <= 420) return 2;
    if (windowWidth <= 599) return tilesInRow > 4 ? tilesInRow - 2 : 2;
    if (windowWidth <= 1024) return tilesInRow - 1;
    return tilesInRow;
  };

export default function useTilesInRow(tilesInRowMax: number) {
  const getTilesInRow = createGetTilesInRow(tilesInRowMax);
  const [tilesInRowAtBreakpoint, setTilesInRow] =
    useState<number>(tilesInRowMax);

  useMount(() => {
    const calculateTilesInRow = throttle(() => {
      setTilesInRow(getTilesInRow(window.innerWidth));
    }, 300);

    window.addEventListener('resize', calculateTilesInRow);

    calculateTilesInRow();

    return () => {
      window.removeEventListener('resize', calculateTilesInRow);
    };
  });

  return tilesInRowAtBreakpoint;
}
