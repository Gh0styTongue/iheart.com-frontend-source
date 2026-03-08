import EVENTS from 'modules/Player/constants/events';
import logger from './logger';
import Player from 'modules/Player/Player';
import processJWError from 'modules/Player/middleware/processErrors/processJWError';
import { blankMP4 } from 'constants/assets';

const player: Player = Player.create({
  autostart: false,
  blankmp4url: blankMP4,
  controls: false,
  height: 0,
  jwlicensekey: 'NgcfD49HOaKFwoEzfSmRRM5GTfZEVq7IdFNb+g==',
  jwscripturl:
    'https://web-static.pages.iheart.com/jw-player/8.7.6/jwplayer.js',
  logger,
  middleware: {
    [EVENTS.ERROR]: [processJWError],
    [EVENTS.PLAY_ATTEMPT_FAILED]: [processJWError],
    [EVENTS.SETUP_ERROR]: [processJWError],
    [EVENTS.WARNING]: [processJWError],
  },
  width: 0,
});

export default player;
