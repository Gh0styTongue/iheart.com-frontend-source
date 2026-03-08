import * as errors from 'web-player/utils/errors';
import CustomStation from 'web-player/models/Custom';
import StationController from './Station';

function CustomController(...args) {
  StationController.apply(this, args);
}

CustomController.prototype = Object.create(StationController.prototype);
CustomController.prototype.constructor = CustomController;

CustomController.prototype.playedFromPrefix = 1;
CustomController.prototype._modelClass = CustomStation;

/**
 * Load a custom station based on seed ID & type
 * @param  {Number} seedId   Seed ID
 * @param  {String} seedType Seed Type (artist/track/featured)
 * @return {Promise}         Promise of the custom station
 */
CustomController.prototype.loadSeedStation = function loadSeedStation(
  seedId,
  seedType,
  profileId,
  sessionId,
) {
  // No credentials? GTFO
  if (!profileId || !sessionId) {
    throw new errors.PlayerError(
      'INVALID_CREDENTIALS',
      `Unable to play ${this._type} without user credentials`,
    );
  }

  return this._createStation({
    id: seedId,
    type: seedType,
  }).save(profileId, sessionId);
};

/**
 * Load a station
 * @param  {Object/models.Custom} station      Station object
 * @return {Promise}             Promise of the custom station
 */
CustomController.prototype.loadStation = function loadStation(station) {
  return Promise.resolve(this._createStation(station));
};

export default CustomController;
