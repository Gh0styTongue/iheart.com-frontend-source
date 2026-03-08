import type { LiveMetaValues } from 'ads/targeting/useLiveMetadata';

export default function isAdPlaying(
  liveMetaData: LiveMetaValues['liveMetaData'],
  isGraceNoteAdvert: boolean,
): boolean {
  if (!liveMetaData && !isGraceNoteAdvert) return false;
  if (liveMetaData?.url?.includes?.('TPID=')) {
    return (
      !(liveMetaData?.url?.includes?.('song_spot="M"') ?? false) &&
      !(liveMetaData?.url?.includes?.('song_spot="F"') ?? false) &&
      !(liveMetaData?.url?.includes?.('song_spot="T"') ?? false) &&
      !(liveMetaData?.title?.includes?.('text="Spot Block End') ?? false)
    );
  }
  return !!isGraceNoteAdvert;
}
