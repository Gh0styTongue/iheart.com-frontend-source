import CatalogImage from 'components/MediaServerImage/CatalogImage';
import Image from 'components/Image';
import NavLink from 'components/NavLink';
import PlayButtonContainer from 'components/Player/PlayButtonContainer';
import PlayButtonContainerPrimitive from 'components/Artist/PlayButtonContainer';
import PlayerStateProxy from 'components/Player/PlayerState/PlayerStateProxy';
import ShowMoreTiles from 'components/ShowMoreTiles';
import Tile from 'components/Tile/Tile';
import Tiles from 'components/Tiles/Tiles';
import Truncate from 'components/Truncate';
import { ImageWrapper } from './primitives';
import { STATION_TYPE } from 'constants/stationTypes';
import { SUBSCRIPTION_TYPE } from 'constants/subscriptionConstants';
import { TILE_RES } from 'components/MediaServerImage';
import { TRIGGER_FROM_TILE } from 'state/Playlist/constants';
import type { Data as ItemSelectedData } from 'modules/Analytics/helpers/itemSelected';
import type { PlaybackTypeValue } from 'constants/stationTypes';

export type CategoryTile = {
  cardId: string;
  id: {
    id: string;
    userId: string;
  };
  imageUrl?: string;
  isPlaylist: boolean;
  subCategoryLink: string;
  subtitle: string;
  title: string;
};

type Props = {
  allAccessPreview: boolean;
  aspectRatio: number;
  isTrialEligible: boolean;
  itemSelectedLocation?: string;
  limit?: number;
  playedFrom: number;
  showAllTiles: boolean;
  subscriptionType: keyof typeof SUBSCRIPTION_TYPE;
  subtitleLines?: number;
  tiles: Array<CategoryTile>;
  tilesInRow: number;
  titleLines?: number;
  useBareImage?: boolean;
};

const PlayButton = PlayerStateProxy(PlayButtonContainer);

const seedType = STATION_TYPE.COLLECTION;

function CategoryTiles({
  allAccessPreview,
  aspectRatio,
  isTrialEligible,
  itemSelectedLocation = '',
  playedFrom,
  showAllTiles,
  subscriptionType,
  subtitleLines = 0,
  tiles = [],
  tilesInRow,
  titleLines = 0,
  useBareImage = false,
}: Props) {
  if (!tiles.length) return null;

  const processTile = (tile: CategoryTile) => {
    const {
      cardId,
      id: { id, userId },
      imageUrl,
      isPlaylist,
      subCategoryLink,
      subtitle,
      title,
    } = tile;
    const subTitle =
      subtitleLines ?
        <Truncate lines={subtitleLines}>{subtitle}</Truncate>
      : undefined;

    const itemSelected = {
      id,
      location: itemSelectedLocation,
      name: title,
      type: seedType as PlaybackTypeValue,
    } as ItemSelectedData;

    const destinationLink = (
      <NavLink itemSelected={itemSelected} to={subCategoryLink}>
        {isPlaylist && (
          <PlayButtonContainerPrimitive>
            <PlayButton
              allAccessPreview={allAccessPreview}
              className="play"
              deferPlay
              isTrialEligible={isTrialEligible}
              name={title}
              playedFrom={playedFrom}
              playedFromTrigger={TRIGGER_FROM_TILE}
              playlistId={id}
              playlistUserId={userId}
              stationType={seedType}
              subscriptionType={subscriptionType}
            />
          </PlayButtonContainerPrimitive>
        )}
        <ImageWrapper>
          {useBareImage ?
            <Image
              alt={title ?? ''}
              aspectRatio={aspectRatio}
              background
              src={imageUrl}
            />
          : <CatalogImage
              alt={title ?? ''}
              aspectRatio={aspectRatio}
              background
              id={id}
              src={imageUrl}
              type={seedType}
              width={TILE_RES * aspectRatio}
            />
          }
        </ImageWrapper>
      </NavLink>
    );

    return {
      children: destinationLink,
      hasBottomMargin: isPlaylist,
      itemSelected,
      key: cardId,
      subTitle,
      tilesInRow,
      title: titleLines && isPlaylist ? title : undefined,
      titleSingleLine: titleLines <= 1,
      url: subCategoryLink,
    };
  };

  return showAllTiles ?
      <Tiles tilesInRow={tilesInRow}>
        {tiles.map(tile => {
          const { children, key, ...props } = processTile(tile);
          return (
            <Tile key={key} {...props}>
              {children}
            </Tile>
          );
        })}
      </Tiles>
    : <ShowMoreTiles
        aspectRatio={aspectRatio}
        subtitleLines={subtitleLines}
        tilesData={tiles.map(processTile)}
        tilesInRow={tilesInRow}
        titleLines={titleLines}
      />;
}

export default CategoryTiles;
