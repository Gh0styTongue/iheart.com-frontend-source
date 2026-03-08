import ArtistAlbums from './ArtistAlbums';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getAppMounted } from 'state/UI/selectors';
import type { Props } from './ArtistAlbums';
import type { State } from 'state/types';

type OwnProps = Omit<Props, 'appMounted'>;

type StateProps = {
  appMounted: Props['appMounted'];
};

const mapStateToProps = createStructuredSelector<State, OwnProps, StateProps>({
  appMounted: getAppMounted,
});

export default connect<StateProps, Record<string, never>, OwnProps, State>(
  mapStateToProps,
)(ArtistAlbums);
