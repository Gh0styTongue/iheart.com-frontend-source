import AlbumArtContainer from './primitives/AlbumArtContainer';
import countryCodes from 'constants/countryCodes';
import ExplicitLyrics from 'components/ExplicitLyrics';
import MediaServerImage, { THUMB_RES } from 'components/MediaServerImage';
import NavLink from 'components/NavLink';
import PlayButton from 'components/Player/PlayButtonContainer';
import PlayButtonLink from 'components/Player/PlayButtonLink/PlayButtonLink';
import PlayButtonWrapper from './primitives/PlayButtonWrapper';
import Rows from './primitives/Rows';
import Separator from './primitives/Separator';
import ShareButton from 'components/Social/Share';
import StyledPlayButton from './primitives/StyledPlayButton';
import ThumbButton from './primitives/ThumbButton';
import ThumbsContainer from './primitives/ThumbsContainer';
import ThumbsDown from 'styles/icons/ThumbsDown';
import ThumbsUp from 'styles/icons/ThumbsUp';
import TrackArtistName from './primitives/TrackArtistName';
import TrackDescription from './primitives/TrackDescription';
import TrackNumberContainer from './primitives/TrackNumberContainer';
import TrackRow from './primitives/TrackRow';
import {
  addOps,
  buildImageUrl,
  buildUrl,
} from 'utils/mediaServerImageMaker/mediaServerImageUrl';
import { AddToPlaylistContext } from 'components/AddToPlaylistModal';
import { buildOpsString, fit } from 'utils/mediaServerImageMaker/opsString';
import { get } from 'lodash-es';
import { getTrackUrl } from 'utils/url';
import { IGetTranslateFunctionResponse } from 'redux-i18n';
import { Menu } from 'components/Tooltip';
import { PlaybackTypeValue, STATION_TYPE } from 'constants/stationTypes';
import { PureComponent } from 'react';
import { SaveDeleteComponent } from 'modules/Analytics/helpers/saveDelete';
import { ShareTypes } from 'components/Social/Share/constants';
import { StationSoftgate } from 'state/Config/types';
import type { PlaybackState } from 'components/Player/PlayerState/types';
import type { Theme } from 'styles/themes/default';
import type { Track } from 'state/Tracks/types';

type Props = {
  alignTrackRow?: string;
  artistId: number;
  artistName: string;
  countryCode: string;
  currentlyPlaying: any;
  dataTest?: string;
  isAllAccessPreview: boolean;
  isAnonymous: boolean;
  isInternationalPlaylistRadioEnabled: boolean;
  isPremiumUser: boolean;
  mediaServerUrl: string;
  onDemandEnabled: boolean;
  overflowEntitlements: Record<string, any>;
  playedFrom: number;
  playingState: PlaybackState;
  openAddToPlaylist: (context: AddToPlaylistContext) => void;
  openSignup: (context: string) => void;
  seedId?: number;
  showTrackOverflow: boolean;
  siteUrl: string;
  stationId: number;
  stationSoftgate: StationSoftgate;
  stationType: PlaybackTypeValue;
  theme: Theme;
  thumbs: {
    [key: number]: number;
  };
  tracks: Array<Track>;
  translate: IGetTranslateFunctionResponse;
  updateThumbsData: (thumbsData: Record<string, any>) => void;
};

export default class ArtistSongRows extends PureComponent<Props> {
  onAddToPlaylist = (trackId: number) => {
    const { isAllAccessPreview, isAnonymous, openAddToPlaylist, openSignup } =
      this.props;

    if (isAllAccessPreview && isAnonymous) {
      openSignup('all_access_Preview');
    } else if (isAnonymous) {
      openSignup('add_to_playlist');
    } else {
      openAddToPlaylist({
        trackIds: [trackId],
        component: SaveDeleteComponent.ListSongsOverflow,
        type: STATION_TYPE.TRACK,
      });
    }
  };

  updateThumb(existingSentiment: number, newSentiment: number, track: Track) {
    const { artistName, updateThumbsData, artistId, stationId } = this.props;
    const { id } = track;

    updateThumbsData({
      existingSentiment,
      seedId: artistId,
      sentiment: newSentiment,
      stationId,
      stationType: STATION_TYPE.ARTIST,
      trackId: id,
      trackingData: {
        id: artistId,
        itemId: artistId,
        itemName: artistName,
        name: artistName,
        songId: id,
        songName: track.title,
        type: 'artist',
      },
    });
  }

  render() {
    const {
      alignTrackRow,
      artistId,
      artistName,
      countryCode,
      currentlyPlaying,
      dataTest,
      isInternationalPlaylistRadioEnabled,
      isPremiumUser,
      mediaServerUrl,
      onDemandEnabled,
      playingState,
      siteUrl,
      theme,
      thumbs,
      tracks,
      translate,
      seedId,
      stationType,
      playedFrom,
    } = this.props;

    return (
      <Rows data-test={dataTest}>
        {tracks.map((track, i) => {
          const {
            imageUrl,
            id,
            playbackRights = {},
            lyricsId,
            explicitLyrics,
            title,
            albumInfo,
            trackNumber,
            artistName: trackArtistName,
          } = track;
          const trackImg =
            imageUrl ?
              buildImageUrl(
                (buildUrl as any)({ mediaServerUrl, siteUrl }, imageUrl),
                addOps(buildOpsString((fit as any)(THUMB_RES, THUMB_RES))()),
              )()
            : null;
          const sentiment = get(thumbs, id, 0);
          const isOnDemandForPremium =
            (playbackRights as { onDemand: boolean }).onDemand || false;
          const moreMenu = [];

          if (
            countryCode === countryCodes.US ||
            isInternationalPlaylistRadioEnabled
          ) {
            moreMenu.push(
              <a
                key="addToPlaylist"
                onClick={() => this.onAddToPlaylist(id)}
                title={translate('Add to Playlist')}
              >
                {translate('Add to Playlist')}
              </a>,
            );
            moreMenu.push(<Separator key="separator" />);
          }

          moreMenu.push(
            <ShareButton
              key="shareButton"
              seedId={id}
              seedType={STATION_TYPE.TRACK}
              stationName={`${artistName} - ${title}`}
              type={ShareTypes.Link}
            />,
          );

          if (lyricsId) {
            moreMenu.push(
              <NavLink
                key="SongPageLink"
                title={translate('Lyrics')}
                to={getTrackUrl(artistId, artistName, id, title!)}
              >
                {translate('Lyrics')}
              </NavLink>,
            );
          }

          const mappedMoreMenu = moreMenu.map(menuItem => (
            <Menu.Item key={menuItem.key}>{menuItem}</Menu.Item>
          ));

          const playbutton = (
            <StyledPlayButton
              artistId={artistId}
              artistName={artistName}
              currentlyPlaying={currentlyPlaying}
              playedFrom={playedFrom}
              playingState={playingState}
              stationId={seedId || id}
              stationType={stationType}
              svgFillColor={theme.colors.black.primary}
              trackId={id}
              trackImg={trackImg}
              trackName={title}
            />
          );

          return (
            <TrackRow
              alignTrackRow={alignTrackRow}
              data-test="track-row"
              disabled={
                !isOnDemandForPremium && onDemandEnabled && isPremiumUser
              }
              key={id}
            >
              {trackImg ?
                <AlbumArtContainer>
                  <MediaServerImage alt="Track Image" src={trackImg} />
                  <PlayButtonWrapper hasImage>{playbutton}</PlayButtonWrapper>
                </AlbumArtContainer>
              : <TrackNumberContainer>
                  <span>
                    {(albumInfo && albumInfo.trackNumber) || trackNumber || i}
                  </span>
                  <PlayButtonWrapper>{playbutton}</PlayButtonWrapper>
                </TrackNumberContainer>
              }
              <TrackDescription>
                <span>
                  <PlayButton
                    artistId={artistId}
                    ButtonComponent={PlayButtonLink}
                    currentlyPlaying={currentlyPlaying}
                    link={{
                      href: getTrackUrl(artistId, artistName, id, title!)!,
                      text: title!,
                    }}
                    playedFrom={playedFrom}
                    playingState={playingState}
                    stationId={seedId || id}
                    stationType={stationType}
                    trackId={id}
                    trackName={title}
                  />
                </span>
                <TrackArtistName>{trackArtistName}</TrackArtistName>
              </TrackDescription>
              <div css={{ marginRight: '1rem' }}>
                {explicitLyrics ?
                  <ExplicitLyrics />
                : null}
              </div>
              <ThumbsContainer data-test="thumbs-container">
                <ThumbButton
                  aria-label="Thumb Down"
                  key="ThumbDownButton"
                  onClick={() =>
                    this.updateThumb(
                      sentiment,
                      sentiment === -1 ? 0 : -1,
                      track,
                    )
                  }
                >
                  <ThumbsDown isFilled={sentiment === -1} />
                </ThumbButton>
                <ThumbButton
                  aria-label="Thumb Up"
                  key="ThumbUpButton"
                  onClick={() =>
                    this.updateThumb(sentiment, sentiment === 1 ? 0 : 1, track)
                  }
                >
                  <ThumbsUp isFilled={sentiment === 1} />
                </ThumbButton>
                {mappedMoreMenu.length > 0 && (
                  <Menu>
                    <Menu.List>{mappedMoreMenu}</Menu.List>
                  </Menu>
                )}
              </ThumbsContainer>
            </TrackRow>
          );
        })}
      </Rows>
    );
  }
}
