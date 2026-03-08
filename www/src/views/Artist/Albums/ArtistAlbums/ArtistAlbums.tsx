import AlbumTilesWrapper from './primitives/AlbumTilesWrapper';
import CatalogImage from 'components/MediaServerImage/CatalogImage';
import Dropdown from 'components/Dropdown/AlbumDropdown';
import InfiniteScroll from 'react-infinite-scroller';
import Loader from 'components/Loader';
import NavLink from 'components/NavLink';
import PlayButtonContainer from 'components/Player/PlayButtonContainer';
import PlayButtonContainerPrimitive from 'components/Artist/PlayButtonContainer';
import PlayerStateProxy from 'components/Player/PlayerState/PlayerStateProxy';
import Tile from 'components/Tile/Tile';
import Tiles from 'components/Tiles/Tiles';
import { AlbumDescription } from 'components/TileDescription';
import { getAlbumUrl } from 'utils/url';
import { PureComponent } from 'react';
import { SaveDeleteView } from 'modules/Analytics/helpers/saveDelete';
import { STATION_TYPE } from 'constants/stationTypes';
import { TILE_RES } from 'components/MediaServerImage';

const PlayButton = PlayerStateProxy(PlayButtonContainer);

export type Props = {
  appMounted: boolean;
  albumPlayback: boolean;
  albums: Array<any>;
  artistId: number;
  artistName: string;
  customRadioEnabled: boolean;
  limit?: number;
  nextAlbumLink: string;
  playedFrom: number;
  requestAdditionalAlbums: (artistId: number, nextAlbumLink: string) => void;
  singleRow: boolean;
  tilesInRow: number;
};

class ArtistAlbums extends PureComponent<Props> {
  static defaultProps = {
    limit: 1000,
  };

  loadItems = () => {
    const { artistId, nextAlbumLink, requestAdditionalAlbums } = this.props;
    requestAdditionalAlbums(artistId, nextAlbumLink);
  };

  render() {
    const {
      appMounted,
      albums,
      artistId,
      artistName,
      albumPlayback,
      customRadioEnabled,
      nextAlbumLink,
      playedFrom,
      singleRow,
      tilesInRow,
    } = this.props;
    const limit = singleRow ? tilesInRow : Infinity;
    return albums.length ?
        <AlbumTilesWrapper data-test="albums-tiles-wrapper" limit={limit}>
          <InfiniteScroll
            hasMore={!!nextAlbumLink}
            loader={<Loader key="albums-loader" />}
            loadMore={this.loadItems}
            pageStart={0}
          >
            <Tiles tilesInRow={tilesInRow}>
              {albums.slice(0, limit).map(album => {
                const { albumId, title, image } = album;
                const url = getAlbumUrl(artistId, artistName, albumId, title);
                const playButton =
                  albumPlayback && customRadioEnabled ?
                    <PlayButtonContainerPrimitive>
                      <PlayButton
                        artistId={artistId}
                        className="play"
                        deferPlay={!!url}
                        playedFrom={playedFrom}
                        seedId={albumId}
                        stationId={albumId}
                        stationType={STATION_TYPE.ALBUM}
                      />
                    </PlayButtonContainerPrimitive>
                  : null;
                return (
                  <Tile
                    data-test="album-tile"
                    dropdown={
                      <Dropdown
                        albumId={albumId}
                        key={`album-${albumId}`}
                        view={SaveDeleteView.AlbumProfile}
                      />
                    }
                    key={`album|${albumId}`}
                    singleRow={singleRow}
                    subTitle={<AlbumDescription stationId={albumId} />}
                    tilesInRow={tilesInRow}
                    title={title}
                    titleSingleLine
                    url={url!}
                  >
                    <NavLink
                      css={{ display: 'block', position: 'relative' }}
                      to={url}
                    >
                      {appMounted && playButton}
                      <CatalogImage
                        alt={title}
                        aspectRatio={1}
                        height={TILE_RES}
                        id={albumId}
                        src={image}
                        type={STATION_TYPE.ALBUM}
                        width={TILE_RES}
                      />
                    </NavLink>
                  </Tile>
                );
              })}
            </Tiles>
          </InfiniteScroll>
        </AlbumTilesWrapper>
      : null;
  }
}

export default ArtistAlbums;
