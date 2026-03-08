import AlbumDescription from './AlbumDescription';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import {
  getCurrentArtistAlbumByIdReleaseDate,
  getCurrentArtistAlbumByIdTopSongs,
} from 'state/Albums/selectors';
import { State } from 'state/types';

export default connect(
  createStructuredSelector<
    State,
    { stationId: number },
    { releaseDate: number; totalSongs: number }
  >({
    releaseDate: getCurrentArtistAlbumByIdReleaseDate,
    totalSongs: getCurrentArtistAlbumByIdTopSongs,
  }),
)(AlbumDescription);
