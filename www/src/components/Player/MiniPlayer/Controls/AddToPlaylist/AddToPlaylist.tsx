import Button from 'components/Player/primitives/Button';
import SaveIcon from 'styles/icons/player/Controls/Save/SaveIcon';
import useFeature from 'hooks/useFeature';
import usePlayerActions from 'components/Player/PlayerActions/usePlayerActions';
import usePlayerState from 'contexts/PlayerState/usePlayerState';

function AddToPlaylist() {
  const actions = usePlayerActions();
  const { addToPlaylistEnabled } = usePlayerState() ?? {};
  const freeUserMyPlaylistEnabled = useFeature('freeUserMyPlaylist');
  const freeUserPlaylistCreationEnabled = useFeature(
    'freeUserPlaylistCreation',
  );
  const internationalPlaylistRadioEnabled = useFeature(
    'internationalPlaylistRadio',
  );

  const isEnabled =
    freeUserMyPlaylistEnabled ||
    freeUserPlaylistCreationEnabled ||
    internationalPlaylistRadioEnabled;

  if (!isEnabled) return null;

  return (
    <Button
      aria-label="Add to Playlist Button"
      data-test="add-to-playlist-button"
      disabled={!addToPlaylistEnabled}
      onClick={actions.addToPlaylist}
    >
      <SaveIcon />
    </Button>
  );
}

export default AddToPlaylist;
