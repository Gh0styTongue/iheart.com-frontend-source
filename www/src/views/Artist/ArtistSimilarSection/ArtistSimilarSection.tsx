import ArtistDropdown from 'components/Dropdown/ArtistDropdown';
import Featuring from 'shared/ui/components/Featuring';
import SimilarSection from 'components/SimilarSection';
import { FunctionComponent, useCallback, useMemo } from 'react';
import { getArtistUrl } from 'utils/url';
import { Props } from './types';
import { RelatedArtist } from 'state/Artists/types';
import { Similar } from 'components/SimilarSection/types';

const ArtistSimilarSection: FunctionComponent<Props> = ({
  artists,
  header = '',
  playedFrom,
  relatedArtists,
  singleRow,
  tilesHaveFixedHeight = false,
  tilesInRow,
  url: artistUrl,
}) => {
  const favoriteIds = useMemo(
    () => Object.keys(artists).filter(id => artists[id].favorite),
    [artists],
  );

  const mapArtistsToSimilar = (artistsToMap: Array<RelatedArtist>) =>
    artistsToMap.map(artist => {
      const seedType = 'artist';
      const logo = artist.image;
      const seedId = artist.artistId;
      const url = getArtistUrl(artist.artistId, artist.name);

      return {
        ...artist,
        logo,
        seedId,
        seedType,
        url,
      };
    });

  const dropdown = useCallback(
    (similar: Similar) => (
      <ArtistDropdown
        artist={similar}
        followed={favoriteIds.includes(String(similar.seedId))}
        key={`artist-${similar.seedId}`}
      />
    ),
    [favoriteIds],
  );

  const subTitle = useCallback(
    ({ seedId }: Similar) => (
      <Featuring artistId={seedId} key={`featuring|${seedId}`} />
    ),
    [],
  );

  return (
    <SimilarSection
      dropdown={dropdown}
      header={header}
      playedFrom={playedFrom}
      similars={mapArtistsToSimilar(relatedArtists) as Array<Similar>}
      singleRow={singleRow}
      subTitle={subTitle}
      tilesHaveFixedHeight={tilesHaveFixedHeight}
      tilesInRow={tilesInRow}
      url={artistUrl}
    />
  );
};

export default ArtistSimilarSection;
