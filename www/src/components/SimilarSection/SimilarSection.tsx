import CatalogImage from 'components/MediaServerImage/CatalogImage';
import NavLink from 'components/NavLink';
import PlayButtonContainer from 'components/Player/PlayButtonContainer';
import PlayButtonContainerPrimitive from 'components/Artist/PlayButtonContainer';
import PlayerStateProxy from 'components/Player/PlayerState/PlayerStateProxy';
import Section from 'components/Section';
import Tile from 'components/Tile/Tile';
import Tiles from 'components/Tiles/Tiles';
import TilesImageWrapper from 'components/Tile/primitives/TilesImageWrapper';
import { getAppMounted } from 'state/UI/selectors';
import { STATION_TYPE, StationTypeValue } from 'constants/stationTypes';
import { TILE_RES } from 'components/MediaServerImage';
import { useSelector } from 'react-redux';
import type { FunctionComponent } from 'react';
import type { Data as ItemSelectedData } from 'modules/Analytics/helpers/itemSelected';
import type { Props } from './types';

const PlayButton = PlayerStateProxy(PlayButtonContainer);

const SimilarSection: FunctionComponent<Props> = ({
  dropdown: Dropdown,
  hasBottomMargin,
  header = '',
  isAbTest = false,
  itemSelectedLocation,
  noHeader = false,
  onHeaderClick = () => {},
  playedFrom,
  similars = [],
  singleRow,
  subTitle: Subtitle,
  suppressFirstOfType,
  tilesInRow,
  url = '',
}) => {
  // IHRWEB-16892 - gotta use a selector to convince react to re-render so that the playbutton will display properly
  // Using __CLIENT__ global will not work unless it is within the component's returned JSX, meaning
  // SSR won't work since we want to show the tiles on server render.
  const appMounted = useSelector(getAppMounted);
  const limit = singleRow ? tilesInRow : 200;
  const similarTiles = (
    <Tiles tilesInRow={tilesInRow}>
      {similars.slice(0, limit).map(similar => {
        const {
          callLetters,
          name,
          rawLogo,
          seedType,
          logo,
          seedId,
          url: similarUrl,
        } = similar;

        /* eslint-disable react/jsx-props-no-spreading */
        const subTitle = <Subtitle key={`artist-${seedId}`} {...similar} />;
        const dropdown = <Dropdown {...similar} />;
        /* eslint-enable react/jsx-props-no-spreading */

        const playButton = appMounted && (
          <PlayButtonContainerPrimitive>
            <PlayButton
              artistName={name}
              className="play"
              deferPlay={!!similarUrl}
              playedFrom={playedFrom}
              seedId={seedId}
              stationId={seedId}
              stationType={seedType}
            />
          </PlayButtonContainerPrimitive>
        );

        const itemSelected = {
          id: seedId,
          location: itemSelectedLocation || '',
          name: callLetters || name,
          type: seedType as 'live' | 'artist',
        } as ItemSelectedData;

        return (
          <Tile
            dropdown={dropdown}
            hasBottomMargin={hasBottomMargin}
            isRoundImage={seedType === STATION_TYPE.ARTIST}
            itemSelected={itemSelected}
            key={`similar|${seedId}`}
            singleRow={singleRow}
            subTitle={subTitle}
            tilesInRow={tilesInRow}
            title={name}
            url={similarUrl}
          >
            <NavLink itemSelected={itemSelected} to={similarUrl}>
              {playButton}
              <TilesImageWrapper liveTile={seedType === 'live'}>
                <CatalogImage
                  alt={name}
                  aspectRatio={1}
                  height={TILE_RES}
                  id={seedId}
                  src={logo || rawLogo}
                  type={seedType as StationTypeValue}
                  width={TILE_RES}
                />
              </TilesImageWrapper>
            </NavLink>
          </Tile>
        );
      })}
    </Tiles>
  );

  if (noHeader) {
    return <span>{similarTiles}</span>;
  }

  return (
    <Section
      dataTest="similar-section"
      hasBorder={false}
      hasExtraPadding={!isAbTest}
      hasMobileBottomLink={isAbTest}
      header={header}
      isHidden={!similars.length}
      onHeaderClick={onHeaderClick}
      suppressFirstOfType={suppressFirstOfType}
      url={url}
    >
      {similarTiles}
    </Section>
  );
};

export default SimilarSection;
