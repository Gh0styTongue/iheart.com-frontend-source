import { AD_PLAYER_ID } from './constants';
import { blankMP4 } from 'constants/assets';
import { waitForGlobal } from '@iheartradio/web.signal';

let player: jwplayer.JWPlayer;

async function setupPlayer() {
  return window.jwplayer(AD_PLAYER_ID).setup({
    file: blankMP4,
    primary: 'html5',
    controls: true,
    width: 640,
    height: 480,
    type: 'mp4',
    advertising: {
      // Use Google IMA sdk to handle VAST
      client: 'googima',
    },
  });
}

export default async function getPlayer(cb: (jw: jwplayer.JWPlayer) => void) {
  if (!window.jwplayer) {
    await waitForGlobal('jwplayer');
  }

  if (!player) {
    player = await setupPlayer();
  }

  return cb(player);
}
