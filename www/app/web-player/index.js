import chromecast from './chromecast';
import Player from './Player';

const player = new Player({ chromecast });

player.isReady();

export default player;
