import AlbumDescription from './Album';
import ArtistDescription from './Artist';
import DefaultDescription from './Default';
import FavoritesDescription from './Favorites';
import LiveDescription from './Live';
import { ComponentType } from 'react';
import { STATION_TYPE, StationTypeValue } from 'constants/stationTypes';

// AV - 3/12/18 - WEB-10910
// TODO: move DLs (for you only) and favorites stations that don't belong to the current user into redux so that we don't have to pass in the description
// as part of this we should connect the default description to the various parts of the store needed for extracting this data.
// https://jira.ihrint.com/browse/WEB-11004

type Props = {
  dataTest?: string;
  description?: string;
  lines?: number;
  stationId: number | string;
  stationType: StationTypeValue;
};

const descriptionsByType: {
  [value in StationTypeValue]?: ComponentType<{
    dataTest?: string;
    description: string;
    lines?: number;
    stationId: number | string;
  }>;
} = {
  [STATION_TYPE.LIVE]: LiveDescription,
  [STATION_TYPE.ARTIST]: ArtistDescription,
  [STATION_TYPE.ALBUM]: AlbumDescription,
  [STATION_TYPE.FAVORITES]: FavoritesDescription,
};

export default function Description({
  stationType,
  stationId,
  description = '',
  dataTest,
  lines = 2,
  ...props
}: Props) {
  const DescriptionComponent = descriptionsByType[stationType];

  return DescriptionComponent ?
      <DescriptionComponent
        dataTest={dataTest}
        description={description || ''}
        lines={lines}
        stationId={stationId}
        {...props}
      />
    : <DefaultDescription dataTest={dataTest} lines={lines}>
        {description || null}
      </DefaultDescription>;
}
