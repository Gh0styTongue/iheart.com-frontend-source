import StationController from './Station';

function CollectionController(...args) {
  StationController.apply(this, args);
}

CollectionController.prototype = Object.create(StationController.prototype);
CollectionController.prototype.constructor = CollectionController;
CollectionController.prototype.supportSkip = true;
CollectionController.prototype.playedFromPrefix = 7;

CollectionController.prototype.loadStation = station =>
  Promise.resolve(station);

export default CollectionController;
