import CatalogImage from 'components/MediaServerImage/CatalogImage';
import Dropdown from 'components/Dropdown/PodcastDropdown';
import NavLink from 'components/NavLink';
import NewEpisodeBadge from 'components/NewEpisodeBadge/NewEpisodeBadge';
import ShowMoreTiles from 'components/ShowMoreTiles';
import Truncate from 'components/Truncate';
import type { Data as ItemSelectedData } from 'modules/Analytics/helpers/itemSelected';
import type { PlaybackTypeValue } from 'constants/stationTypes';
import type { Podcast } from 'state/Podcast/types';

type Props = {
  aspectRatio?: number;
  displayLimit?: number;
  hasBottomMargin?: boolean;
  imgWidth: number;
  itemSelectedLocation?: string;
  podcasts: Array<Podcast>;
  tilesInRow?: number;
};

function PodcastTiles({
  aspectRatio = 1,
  displayLimit,
  hasBottomMargin,
  imgWidth,
  itemSelectedLocation,
  podcasts = [],
  tilesInRow = 4,
}: Props) {
  if (!podcasts.length) return null;

  const titleLines = 1;
  const subtitleLines = 2;

  const tilesData = podcasts.map((podcast: Podcast) => {
    const {
      title,
      description,
      imgUrl,
      url,
      followed,
      seedType,
      seedId,
      newEpisodeCount,
    } = podcast;
    const subTitle = <Truncate lines={subtitleLines}>{description}</Truncate>;

    const itemSelected = {
      id: seedId,
      location: itemSelectedLocation,
      name: title,
      type: seedType as PlaybackTypeValue,
    } as ItemSelectedData;

    const destinationLink = (
      <NavLink itemSelected={itemSelected} to={url}>
        <NewEpisodeBadge newEpisodeCount={newEpisodeCount} />
        <CatalogImage
          alt={title}
          aspectRatio={aspectRatio}
          height={imgWidth}
          id={seedId}
          src={imgUrl}
          type={seedType}
          width={imgWidth}
        />
      </NavLink>
    );

    return {
      children: destinationLink,
      dropdown: (
        <Dropdown
          followed={followed}
          key={`dropdown-${seedId}`}
          seedId={seedId}
          title={title}
        />
      ),
      hasBottomMargin,
      itemSelected,
      key: seedId,
      subTitle,
      tilesInRow,
      title,
      titleSingleLine: titleLines === 1,
      url,
    };
  });

  return (
    <ShowMoreTiles
      aspectRatio={aspectRatio}
      displayLimit={displayLimit}
      subtitleLines={subtitleLines}
      tilesData={tilesData}
      tilesInRow={tilesInRow}
      titleLines={titleLines}
    />
  );
}

export default PodcastTiles;
