import Caret from './icons/Caret';
import createTile from './createTile';
import dimensions from 'styles/dimensions';
import getPxFromRemStr from './getPxFromRemStr';
import OutlinedButton from 'primitives/Buttons/OutlinedButton';
import useTilesInRow from './useTilesInRow';
import useTranslate from 'contexts/TranslateContext/useTranslate';
import {
  RevealTilesContainer,
  RevealTileContainer as TileContainer,
} from './primitives';
import { useEffect, useRef, useState } from 'react';
import type { EmotionJSX } from '@emotion/react/types/jsx-namespace';
import type { RevealTilesProps, TileData } from './types';

const headerHeight = getPxFromRemStr(dimensions.headerHeight);

function RevealTiles({
  itemCount,
  loadMoreItems,
  tilesData = [],
  tilesInRow,
}: RevealTilesProps) {
  const translate = useTranslate();
  const tilesInRowAtBreakpoint = useTilesInRow(tilesInRow);
  const [rows, setRows] = useState<number>(1);
  const [moreTiles, setMoreTiles] = useState<number | '...'>('...');
  const [singleRow, setSingleRow] = useState<boolean>(rows === 1);
  const createTileAddProps = (tileData: TileData) =>
    createTile({ ...tileData, singleRow, TileContainer });
  const [tiles, setTiles] = useState<Array<EmotionJSX.Element>>(
    tilesData.map(createTileAddProps),
  );
  const sectionTopRef = useRef<HTMLUListElement>(null);
  const graduallyRevealTiles = !!loadMoreItems;

  useEffect(() => {
    setSingleRow(rows === 1);
  }, [rows]);

  useEffect(() => {
    setTiles(tilesData.map(createTileAddProps));
  }, [singleRow, tilesData]);

  useEffect(() => {
    if (graduallyRevealTiles) {
      setMoreTiles(Math.min((rows + 2) * tilesInRowAtBreakpoint, itemCount));
    }
  }, [rows, tilesInRowAtBreakpoint]);

  if (!tilesData?.length) return null;

  const showMore = () => {
    if (graduallyRevealTiles) {
      setRows(rows + 2);
    } else {
      setRows(Infinity);
    }
  };

  const showLess = () => {
    const boundingClientRectTop =
      sectionTopRef?.current?.getBoundingClientRect().top ?? headerHeight;
    // if we're about to collapse the tiles and the section top is out of view, scroll to keep the
    // category in view. out of viewport is less than 0; behind header is less than headerHeight.
    if (boundingClientRectTop < headerHeight) {
      window?.scroll?.({
        behavior: 'smooth',
        top: (window.pageYOffset ?? 0) + boundingClientRectTop - headerHeight,
      });
    }
    setRows(1);
  };

  const visibleTiles = Math.min(rows * tilesInRowAtBreakpoint, itemCount);

  const seeMoreButtonVisible = rows * tilesInRowAtBreakpoint < itemCount;
  const seeLessButtonVisible = rows > 1;

  const buttonCss = { margin: '0 1rem' };

  return (
    <>
      <RevealTilesContainer ref={sectionTopRef} tilesInRow={tilesInRow}>
        {tiles.slice(0, visibleTiles)}
      </RevealTilesContainer>
      <div css={{ display: 'flex', justifyContent: 'center' }}>
        {seeMoreButtonVisible ?
          <OutlinedButton
            css={buttonCss}
            disabled={Number.isNaN(moreTiles)}
            onClick={showMore}
          >
            {graduallyRevealTiles ?
              translate('See {moreTiles} of {itemCount}', {
                itemCount,
                moreTiles,
              })
            : translate('See All')}
            <Caret direction="down" />
          </OutlinedButton>
        : null}
        {seeLessButtonVisible ?
          <OutlinedButton css={buttonCss} onClick={showLess}>
            {translate('See Less')}
            <Caret direction="up" />
          </OutlinedButton>
        : null}
      </div>
    </>
  );
}

export default RevealTiles;
