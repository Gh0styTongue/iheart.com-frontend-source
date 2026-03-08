import * as React from 'react';
import DefaultTileContainer from './primitives/TileContainer';
import DummySubtitle from './primitives/DummySubtitle';
import DummyTile from './primitives/DummyTile';
import DummyTitle from './primitives/DummyTitle';
import NavLink from 'components/NavLink';
import ShouldShow from 'components/ShouldShow';
import TileInfo from './primitives/TileInfo';
import TileSubtitle from './primitives/TileSubtitle';
import TileThumb from './primitives/TileThumb';
import TileTitle from './primitives/TileTitle';
import Truncate from 'components/Truncate';
import useTouch from 'hooks/useTouch';
import { getIsMobile } from 'state/Environment/selectors';
import { useSelector } from 'react-redux';
import type { CSSProperties } from 'react';
import type { Data as ItemSelectedData } from 'modules/Analytics/helpers/itemSelected';
import type { StyledComponent } from '@emotion/styled';

export type Props = {
  children?: any;
  className?: string;
  dropdown?: React.ReactNode;
  dataTest?: string | null;
  hasBottomMargin?: boolean;
  hideDummySubtitle?: boolean;
  horizontalScroll?: boolean;
  isDummyTile?: boolean;
  isRoundImage?: boolean;
  itemSelected?: ItemSelectedData;
  maxImageWidth?: string;
  noHoverEffect?: boolean;
  noTileOnMobile?: boolean;
  shareTile?: boolean;
  singleRow?: boolean;
  style?: CSSProperties;
  subTitle?: string | React.ReactNode;
  TileContainer?: StyledComponent<any>;
  tileDelay?: number;
  tilePosition?: number;
  tilesInRow?: number;
  title?: string | React.ReactNode;
  titleSingleLine?: boolean;
  url?: string;
};

function Tile({
  children = null,
  className = '',
  dropdown = null,
  dataTest = null,
  hasBottomMargin,
  hideDummySubtitle = false,
  horizontalScroll,
  isDummyTile = false,
  isRoundImage = false,
  itemSelected,
  maxImageWidth,
  noHoverEffect,
  noTileOnMobile,
  shareTile = false,
  singleRow = false,
  style = {},
  subTitle = '',
  TileContainer = DefaultTileContainer,
  tileDelay = 2,
  tilePosition = 0,
  tilesInRow = undefined,
  title = '',
  titleSingleLine = false,
  url = '',
}: Props) {
  const mobile = useSelector(getIsMobile);
  const isTouch = useTouch();

  const tileTitle =
    isDummyTile ?
      <DummyTitle />
    : <TileTitle data-test="station-tile-title">
        <NavLink itemSelected={itemSelected} to={url}>
          <Truncate lines={titleSingleLine ? 1 : 2}>{title}</Truncate>
        </NavLink>
      </TileTitle>;

  const tileSubtitle =
    isDummyTile ?
      <ShouldShow shouldShow={!hideDummySubtitle}>
        <DummySubtitle />
      </ShouldShow>
    : <TileSubtitle
        data-test="station-tile-sub-title"
        titleText={typeof title === 'string' ? title : true}
      >
        {subTitle}
      </TileSubtitle>;

  const tileInfo = (
    <TileInfo data-test="station-tile-info" hasBottomMargin={hasBottomMargin}>
      {tileTitle}
      {tileSubtitle}
      {dropdown}
    </TileInfo>
  );

  return (
    <TileContainer
      className={className}
      data-test={dataTest || 'station-tile'}
      horizontalScroll={horizontalScroll}
      isTouch={isTouch}
      maxImageWidth={maxImageWidth}
      noTileOnMobile={noTileOnMobile}
      singleRow={singleRow}
      style={style}
      tileDelay={tileDelay}
      tilePosition={tilePosition}
      tilesInRow={tilesInRow}
    >
      {isDummyTile ?
        <DummyTile isRoundImage={isRoundImage} />
      : <TileThumb
          data-test="station-tile-thumbnail"
          isRoundImage={isRoundImage}
          mobile={mobile}
          noHoverEffect={noHoverEffect}
        >
          {children}
        </TileThumb>
      }
      {!shareTile ? tileInfo : null}
    </TileContainer>
  );
}

export default Tile;
