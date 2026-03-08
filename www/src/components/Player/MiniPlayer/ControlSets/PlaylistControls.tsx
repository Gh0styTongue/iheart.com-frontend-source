import Controls from '../Controls';
import PlaylistTypes from 'constants/playlistTypes';
import { getCurrentType } from 'state/Playlist/selectors';
import { getSubscriptionType } from 'state/Entitlements/selectors';
import { SUBSCRIPTION_TYPE } from 'constants/subscriptionConstants';
import { useSelector } from 'react-redux';

type Props = {
  fullscreen?: boolean;
};

function PlaylistControls({ fullscreen }: Props) {
  const subscriptionType = useSelector(getSubscriptionType);
  const playlistType = useSelector(getCurrentType);
  const isMyPlaylist = playlistType === PlaylistTypes.Default;
  const isPremiumUser = subscriptionType === SUBSCRIPTION_TYPE.PREMIUM;

  return (
    <Controls fullscreen={fullscreen}>
      <Controls.AddToPlaylist />
      {isMyPlaylist && !isPremiumUser ?
        <Controls.Replay />
      : <Controls.Previous />}
      <Controls.Play />
      <Controls.Next />
    </Controls>
  );
}

export default PlaylistControls;
