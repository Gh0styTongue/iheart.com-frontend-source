import factory from 'state/factory';
import getTracks from 'services/getTracks';
import { getAmpUrl } from 'state/Config/selectors';
import { getCredentials } from 'state/Session/selectors';

export default function getArtistSeedFromRadioId(radioId: number) {
  const store = factory();
  const state = store.getState();
  const { profileId, sessionId } = getCredentials(state);
  return getTracks(getAmpUrl(state), profileId!, sessionId!, radioId);
}
