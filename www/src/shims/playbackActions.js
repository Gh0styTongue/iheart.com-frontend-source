import hub, { E } from 'shared/utils/Hub';
import { debounce } from 'lodash-es';

function createRadio({ stationType, playedFrom, stationId, ...opts }) {
  hub.trigger(E.CREATE_RADIO, stationType, stationId, playedFrom, { ...opts });
  return true;
}

function togglePlayback(playedFrom, trackingContext) {
  hub.trigger(E.PLAYER_PLAY_TOGGLED, { playedFrom, trackingContext });
  return true;
}

/**
 * IHRWEB-16505 a shim which acts as a way to "load" a station and return a "play" method. This really shouldn't
 * be used anywhere except for the player shims.tsx file & inside of PlayButtonContainer
 */
function createDeferrableRadio({
  playingState,
  stationType,
  playedFrom,
  stationId,
  ...opts
}) {
  const createStation = (loadOnly = false) =>
    createRadio({
      stationType,
      stationId,
      playedFrom,
      ...opts,
      noPlay: loadOnly,
    });

  if (playingState === 'PLAYING') togglePlayback();
  hub.trigger(E.PLAY_STATE_CHANGED, 'BUFFERING');

  const debounced = debounce(
    cb => {
      cb();
    },
    100,
    { leading: true },
  );

  return () => debounced(() => createStation());
}

export { createRadio, createDeferrableRadio, togglePlayback };
