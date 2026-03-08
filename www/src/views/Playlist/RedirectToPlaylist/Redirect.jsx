import { connect } from 'react-redux';
import {
  redirectToPlaylistById as redirectToPlaylistByIdAction,
  redirectToPlaylistByType as redirectToPlaylistByTypeAction,
} from 'state/Playlist/actions';

export default function makePlaylistRedirect({
  playlistIdentifier,
  fallback,
  byId = false,
}) {
  class RedirectToPlaylist extends React.Component {
    componentDidMount() {
      const { redirectToPlaylistByType, redirectToPlaylistById } = this.props;
      if (byId) {
        redirectToPlaylistById({ fallback, playlistId: playlistIdentifier });
      } else {
        redirectToPlaylistByType({
          fallback,
          playlistType: playlistIdentifier,
        });
      }
    }

    render() {
      return null;
    }
  }

  return connect(null, {
    redirectToPlaylistByType: redirectToPlaylistByTypeAction,
    redirectToPlaylistById: redirectToPlaylistByIdAction,
  })(RedirectToPlaylist);
}
