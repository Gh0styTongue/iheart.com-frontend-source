import PlayerState from 'web-player/PlayerState';
import type PlayerStateClass from 'web-player/PlayerState';

let playerState: PlayerStateClass;

/**
 * This shim should primarily be used to get station info from the player. This information isn't easily accessible elsewhere
 * Going to leave this in for now in case we end up needing it.
 */
export default function getLegacyPlayerState() {
  if (!playerState) {
    playerState = PlayerState.getInstance();
  }

  return playerState;
}
