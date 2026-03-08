import PodcastStation from 'web-player/models/Podcast';
import StationController from './Station';

function PodcastController(...args) {
  StationController.apply(this, args);
}

PodcastController.prototype = Object.create(StationController.prototype);
PodcastController.prototype.constructor = PodcastController;
PodcastController.prototype.playedFromPrefix = 5;
PodcastController.prototype._modelClass = PodcastStation;

PodcastController.prototype.loadStation = function loadStation(station) {
  return Promise.resolve(this._createStation(station));
};

export default PodcastController;
