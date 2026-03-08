import Events from '../constants/events';
import { composeEventData, namespace, property } from '../factories';
import { station, Station, Data as StationData } from './station';

export enum SaveDeleteAction {
  AddToPlaylist = 'add_to_playlist',
  DeleteFromMyMusic = 'delete_from_my_music',
  DeleteFromPlaylist = 'delete_from_playlist',
  DeletePlaylist = 'delete_playlist',
  SavePlalist = 'save_playlist',
  SaveToMyMusic = 'save_to_my_music',
}

export enum SaveDeleteView {
  AlbumProfile = 'album_profile',
  ArtistProfile = 'artist_profile',
  CuratedPlaylistProfile = 'curated_playlist_profile',
  FullScreenPlayer = 'full_screen_player',
  MiniPlayer = 'mini_player',
  MyPlaylistProfile = 'my_playlist_profile',
  NewForYouPlaylistProfile = 'new_for_you_playlist_profile',
  PlaylistRadioProfile = 'playlist_radio_profile',
  UserPlaylistProfile = 'user_playlist_profile',
}

export enum SaveDeleteComponent {
  ListSongsOverflow = 'list_songs_overflow',
  ListAlbumsOverflow = 'list_albums_overflow',
  MiniPlayer = 'mini_player',
  Overflow = 'overflow',
}

type Action = SaveDeleteAction;
type Location = `${SaveDeleteView}|${SaveDeleteComponent}|${SaveDeleteAction}`;

export type Data = StationData & {
  action: Action;
  location?: Location;
};

export type SaveDelete = Station & {
  saveDelete: {
    action: Action;
    location?: Location;
  };
};

function saveDelete(data: Data): SaveDelete {
  return composeEventData(Events.SaveDelete)(
    namespace('saveDelete')(property('action', data.action, true)),
    namespace('event')(property('location', data.location, false)),
    station(data),
  ) as SaveDelete;
}

export default saveDelete;
