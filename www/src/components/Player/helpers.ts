import { PlaybackState } from 'components/Player/MiniPlayer/types';

export function whatShouldPlayButtonShow(
  adIsPlaying: boolean,
  adIsPresent: boolean,
  playbackState: PlaybackState,
): {
  loadingAnimation: boolean;
  stopPauseIcon: boolean;
  playIcon: boolean;
} {
  return {
    loadingAnimation:
      (adIsPresent && adIsPlaying) ||
      (!adIsPresent &&
        [PlaybackState.Buffering, PlaybackState.Loading].includes(
          playbackState,
        )),
    stopPauseIcon:
      (adIsPresent && adIsPlaying) ||
      (!adIsPresent &&
        [
          PlaybackState.Buffering,
          PlaybackState.Loading,
          PlaybackState.Playing,
        ].includes(playbackState)),
    playIcon:
      (adIsPresent && !adIsPlaying) ||
      (!adIsPresent &&
        [PlaybackState.Idle, PlaybackState.Paused].includes(playbackState)),
  };
}
