import * as React from 'react';
import SimilarArtistAside from './SimilarArtistAside';
import { artistProfileReceived } from 'state/Artists/actions';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getAmpUrl } from 'state/Config/selectors';
import {
  getCurrentArtistId,
  getCurrentArtistName,
  getCurrentArtistRelatedArtists,
} from 'state/Artists/selectors';
import { localize } from 'redux-i18n';
import { State } from 'state/types';
import type { DispatchProps, OwnProps, StateProps } from './types';

const mapStateToProps = createStructuredSelector<State, StateProps>({
  ampUrl: getAmpUrl,
  artistId: getCurrentArtistId,
  artistName: getCurrentArtistName,
  relatedArtists: getCurrentArtistRelatedArtists,
});

const mapDispatchToProps = {
  artistProfileReceived,
};

export default compose(
  localize('translate'),
  connect(mapStateToProps, mapDispatchToProps as DispatchProps),
)(SimilarArtistAside) as React.ComponentType<OwnProps>;
