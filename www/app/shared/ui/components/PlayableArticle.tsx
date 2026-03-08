import Article from 'components/Article';
import CatalogImage from 'components/MediaServerImage/CatalogImage';
import Hover from './primitives/Hover';
import Mask from './primitives/Mask';
import NavLink from 'components/NavLink';
import P from 'primitives/Typography/BodyCopy/P';
import PlayButtonContainer from 'components/Player/PlayButtonContainer';
import PlayButtonWrapper from './primitives/PlayButtonWrapper';
import PlayerStateProxy from 'components/Player/PlayerState/PlayerStateProxy';
import PlaylistImage from 'components/MediaServerImage/PlaylistImage';
import SaveOverflowDropdown from 'components/SaveOverflowDropdown';
import SearchLink from 'components/SearchLink/SearchLink';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { encodePlaylistSeedId, isPlaylist } from 'state/Playlist/helpers';
import { get } from 'lodash-es';
import { getCustomRadioEnabled } from 'state/Features/selectors';
import {
  getEntitlements,
  showUpsellSong2StartSelector,
  songToStartSelector,
} from 'state/Entitlements/selectors';
import { getSessionId } from 'state/Session/selectors';
import { navigate as navigateAction } from 'state/Routing/actions';
import { STATION_TYPE } from 'constants/stationTypes';
import { truncate } from 'utils/string';

import type { Entitlements } from 'state/Entitlements/types';
import type { FunctionComponent } from 'react';
import type { PlayedFrom } from 'modules/Analytics/types';
import type { State as RootState } from 'state/types';
import type { StationTypeValue } from 'constants/stationTypes';

const PlayButton = PlayerStateProxy(PlayButtonContainer);

function escapeRegExp(string: string) {
  return string.replace(/([.*+?^${}()|[\]/\\])/g, '\\$1');
}

const getString = (s: string | number | null) => String(s || '');

type SelectorProps = {
  showPlayEntitlement: string;
};

type DispatchProps = {
  navigate: typeof navigateAction;
};

type StateProps = {
  customRadioEnabled: boolean;
  sessionId: any;
  showPlayButton?: boolean;
  song2Start?: boolean;
  showUpsellSong2Start?: boolean;
};

type OwnProps = {
  artistId: any;
  artistName: any;
  bestMatch?: boolean;
  catalogId: string | number;
  catalogType: StationTypeValue;
  catalogUserId: string | number | null;
  dataTest?: string;
  description?: string | JSX.Element;
  descriptionUrl?: string;
  dropdownExtendDown: any;
  explicitLyrics?: boolean;
  filter?: any;
  hidePadding?: boolean;
  highlight?: string;
  id: any;
  imgHeight?: number;
  imgUrl: string;
  imgWidth?: number;
  isOnDemandTrack: any;
  itemSelected: any;
  onClick?: () => any;
  ownerId?: number;
  playedFrom: PlayedFrom;
  playedFromFilter?: string | Record<string, any>;
  search: any;
  subscriptionType: any;
  title?: string;
  trackingContext?: string;
  url: string;
  itemId?: number;
  showRegGate?: boolean;
};

type Props = OwnProps & DispatchProps & SelectorProps & StateProps;

const PlayableArticle: FunctionComponent<Props> = ({
  artistId,
  artistName,
  bestMatch = false,
  catalogId,
  catalogType,
  catalogUserId,
  customRadioEnabled,
  dataTest,
  descriptionUrl,
  dropdownExtendDown, //  Dropdown points down if top page search results, to not get cut off.
  explicitLyrics = false,
  filter = '',
  hidePadding,
  highlight,
  imgHeight,
  imgUrl,
  imgWidth,
  isOnDemandTrack,
  itemSelected,
  navigate,
  onClick,
  ownerId,
  playedFrom,
  search,
  showPlayButton,
  showUpsellSong2Start,
  song2Start,
  title,
  url,
  itemId,
  showRegGate,
  ...props
}) => {
  const LinkComponent = search ? SearchLink : NavLink;
  const thumbnail = [];
  let description = props.description || '';
  let descriptionLen;
  let header;
  let regex;

  thumbnail.push(
    isPlaylist(catalogType) ?
      <PlaylistImage
        alt={title}
        aspectRatio={1}
        className={`${catalogType}-thumb-img`}
        key="logo"
        src={imgUrl}
        width={imgWidth}
      />
    : <CatalogImage
        alt={title ?? ''}
        aspectRatio={1}
        className={`${catalogType}-thumb-img`}
        height={imgHeight}
        id={catalogId}
        key="logo"
        src={imgUrl}
        type={catalogType}
        width={imgWidth}
      />,
  );

  const playbackPrevented = !!(
    catalogType === STATION_TYPE.ARTIST && !customRadioEnabled
  );

  if (catalogType && catalogId && catalogType !== STATION_TYPE.PODCAST) {
    thumbnail.push(
      <Hover data-test={dataTest} key="logo-action">
        <Mask />
        {showPlayButton && !playbackPrevented ?
          <PlayButtonWrapper>
            <PlayButton
              artistId={artistId}
              artistName={artistName}
              currentAlbumId={catalogId}
              currentAlbumTitle={title}
              deferPlay={!!url}
              name={catalogType === 'track' ? undefined : title}
              playedFrom={playedFrom}
              playlistId={String(catalogId)}
              playlistUserId={catalogUserId || ownerId}
              showUpsellSong2Start={showUpsellSong2Start}
              song2Start={song2Start}
              stationId={catalogId}
              stationType={catalogType}
              subscriptionType={props.subscriptionType}
              trackId={props.id}
              trackName={title}
            />
          </PlayButtonWrapper>
        : null}
      </Hover>,
    );
  }

  // If we wanna highlight certain words
  if (typeof description === 'string') {
    switch (
      catalogType // catalog types have varying description lengths
    ) {
      case 'collection':
      case 'track':
        descriptionLen = 35;
        break;
      case 'talk':
        descriptionLen = 75;
        break;
      default:
        descriptionLen = 43;
    }

    description = truncate(description || '', descriptionLen);

    if (highlight) {
      regex = new RegExp(escapeRegExp(highlight), 'gi');

      // Highlight the title
      const highlightedTitle =
        (title &&
          title.replace(
            regex,
            token => `<span css={{ fontWeight: "bold" }}>${token}</span>`,
          )) ||
        '';

      // Highlight the desc
      description = description.replace(
        regex,
        token => `<span css={{ fontWeight: "bold" }}>${token}</span>`,
      );

      // Create new header & description
      header = (
        <LinkComponent
          href={url}
          html={highlightedTitle}
          itemSelected={itemSelected}
          navigate={navigate}
          onClick={onClick}
          title={title}
          to={url}
        />
      );
      if (descriptionUrl) {
        description = (
          <LinkComponent
            href={descriptionUrl}
            itemSelected={itemSelected}
            navigate={navigate}
            to={descriptionUrl}
          >
            <span dangerouslySetInnerHTML={{ __html: description }} />
          </LinkComponent>
        );
      } else {
        description = (
          <P
            color={colors => colors.gray.medium!}
            fontSize={size => size.xsmall}
          >
            <div dangerouslySetInnerHTML={{ __html: description }} />
          </P>
        );
      }
    } else {
      // Create new header & description
      header = (
        <LinkComponent
          href={url}
          itemSelected={itemSelected}
          navigate={navigate}
          onClick={onClick}
          title={title}
          to={url}
        >
          {title}
        </LinkComponent>
      );
      if (descriptionUrl) {
        description = (
          <LinkComponent
            href={descriptionUrl}
            itemSelected={itemSelected}
            navigate={navigate}
            onClick={onClick}
            title={description}
            to={descriptionUrl}
          >
            {description}
          </LinkComponent>
        );
      } else {
        description = (
          <P
            color={colors => colors.gray.medium!}
            fontSize={size => size.xsmall}
          >
            {description}
          </P>
        );
      }
    }
  }

  // if playlist, encode seedId so it returns correct formate of [PLAYLIST_OWNER_ID]/[PLAYLIST_ID]
  const seedId =
    catalogType === STATION_TYPE.COLLECTION ?
      encodePlaylistSeedId(catalogUserId, catalogId)
    : catalogId;

  const dropdown = (
    <SaveOverflowDropdown
      catalogId={Number(catalogId)}
      catalogType={catalogType}
      dropdownExtendDown={dropdownExtendDown}
      isOnDemandTrack={isOnDemandTrack}
      playedFrom={playedFrom}
      playlistId={getString(catalogId)}
      playlistUserId={getString(catalogUserId)}
      seedId={seedId}
    />
  );

  return (
    <Article
      artistName={artistName}
      bestMatch={bestMatch}
      catalogType={catalogType}
      description={description}
      dropdown={dropdown}
      explicitLyrics={explicitLyrics}
      filter={filter}
      header={header}
      hidePadding={hidePadding}
      imgHeight={imgHeight}
      imgUrl={imgUrl}
      imgWidth={imgWidth}
      itemId={itemId}
      itemSelected={itemSelected}
      onClick={onClick}
      search={search}
      showRegGate={showRegGate}
      supressDeepLink={false}
      thumbnail={thumbnail}
      title={title}
      typeLabel={null}
      url={url}
    />
  );
};

/*  The actual selector used to determine whether or not to show the play button is passed in via a prop. 
    Check apps-legacy/www/src/components/SearchSection/SearchSection.jsx for an example */
const getPlayEntitlement = (_: RootState, { showPlayEntitlement }: Props) =>
  showPlayEntitlement;

const showPlayButtonSelector = createSelector<
  RootState,
  Props,
  Entitlements,
  string,
  boolean
>([getEntitlements, getPlayEntitlement], (entitlements, showPlayEntitlement) =>
  showPlayEntitlement ? get(entitlements, showPlayEntitlement, false) : true,
);

const mapStateToProps = createStructuredSelector<RootState, Props, StateProps>({
  customRadioEnabled: getCustomRadioEnabled,
  sessionId: getSessionId,
  showPlayButton: showPlayButtonSelector,
  song2Start: songToStartSelector,
  showUpsellSong2Start: showUpsellSong2StartSelector,
});

export default connect(mapStateToProps, { navigate: navigateAction })(
  PlayableArticle,
);
