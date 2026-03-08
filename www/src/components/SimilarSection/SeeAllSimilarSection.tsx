import CatalogImage from 'components/MediaServerImage/CatalogImage';
import NavLink from 'components/NavLink';
import PlayButtonContainer from 'components/Player/PlayButtonContainer';
import PlayButtonContainerPrimitive from 'components/Artist/PlayButtonContainer';
import PlayerStateProxy from 'components/Player/PlayerState/PlayerStateProxy';
import Section from 'components/Section';
import ShowMoreTiles from 'components/ShowMoreTiles';
import TilesImageWrapper from 'components/Tile/primitives/TilesImageWrapper';
import { getAppMounted } from 'state/UI/selectors';
import { getCustomRadioEnabled } from 'state/Features/selectors';
import { STATION_TYPE, StationTypeValue } from 'constants/stationTypes';
import { TILE_RES } from 'components/MediaServerImage';
import { useSelector } from 'react-redux';
import type { FunctionComponent } from 'react';
import type { Data as ItemSelectedData } from 'modules/Analytics/helpers/itemSelected';
import type { Props } from './types';

const PlayButton = PlayerStateProxy(PlayButtonContainer);

const subtitleLines = 2;
const titleLines = 2;

const SimilarSection: FunctionComponent<Props> = ({
  canPlaylist = false,
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
  tilesInRow = 4,
  url = '',
}) => {
  const customRadioEnabled = useSelector(getCustomRadioEnabled);

  // IHRWEB-16892 - gotta use a selector to convince react to re-render so that the playbutton will display properly
  // Using __CLIENT__ global will not work unless it is within the component's returned JSX, meaning
  // SSR won't work since we want to show the tiles on server render.
  const appMounted = useSelector(getAppMounted);
  // const limit = singleRow ? tilesInRow : 200;
  const similarTiles = similars.map(similar => {
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

    const playButton =
      appMounted && canPlaylist && customRadioEnabled ?
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
      : null;

    const itemSelected = {
      id: seedId,
      location: itemSelectedLocation || '',
      name: callLetters || name,
      type: seedType as 'live' | 'artist',
    } as ItemSelectedData;

    return {
      children: (
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
      ),
      dropdown,
      hasBottomMargin,
      itemSelected,
      isRoundImage: seedType === STATION_TYPE.ARTIST,
      key: `similar|${seedId}`,
      singleRow,
      subTitle,
      tilesInRow,
      title: name,
      url: similarUrl,
    };
  });

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
      <ShowMoreTiles
        subtitleLines={subtitleLines}
        tilesData={similarTiles}
        tilesInRow={tilesInRow}
        titleLines={titleLines}
      />
    </Section>
  );
};

export default SimilarSection;
