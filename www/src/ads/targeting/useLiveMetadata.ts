import usePlayerState from 'contexts/PlayerState/usePlayerState';
import type { AtLeastOneRequired } from 'types/utilityTypes';
import type { AudioAdProvider } from 'ads/constants';
import type { PlaybackState } from 'components/Player/PlayerState/types';

export type LiveMetaValues = {
  liveMetaData?: AtLeastOneRequired<{
    comment: string;
    COMM: string | { ENG: string };
  }> & { url: string; title: string };
  audioAdProvider?: AudioAdProvider;
  adswizzZones?: { 'display-zone': string };
  playbackState: PlaybackState;
  isGraceNoteAdvert?: boolean;
};

function useLiveMetadata(): LiveMetaValues {
  const {
    liveMetaData,
    audioAdProvider,
    adswizzZones,
    playbackState,
    isGraceNoteAdvert,
  } = usePlayerState() ?? {};

  // TODO: just return the computed context string

  return {
    liveMetaData,
    audioAdProvider,
    adswizzZones,
    playbackState,
    isGraceNoteAdvert,
  } as LiveMetaValues;
}

export default useLiveMetadata;
