import ArtistHead from './ArtistHead';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import {
  getCurrentArtistName,
  getCurrentArtistTopTracks,
} from 'state/Artists/selectors';
import { getSiteUrl } from 'state/Config/selectors';
import { State } from 'state/buildInitialState';
import type { Track } from 'state/Artists/types';

export default connect(
  createStructuredSelector<
    State,
    {
      artistName: string;
      siteUrl: string;
      topTracks: Array<Track>;
    }
  >({
    artistName: getCurrentArtistName,
    siteUrl: getSiteUrl,
    topTracks: getCurrentArtistTopTracks,
  }),
)(ArtistHead);
