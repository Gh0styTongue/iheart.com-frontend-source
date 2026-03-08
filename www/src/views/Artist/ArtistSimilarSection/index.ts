import ArtistSimilarSection from './ArtistSimilarSection';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import {
  getArtists,
  getCurrentArtistRelatedArtists,
} from 'state/Artists/selectors';
import { State } from 'state/types';
import { StateProps } from './types';

export default connect(
  createStructuredSelector<State, StateProps>({
    artists: getArtists,
    relatedArtists: getCurrentArtistRelatedArtists,
  }),
)(ArtistSimilarSection);
