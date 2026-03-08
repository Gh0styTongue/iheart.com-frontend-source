import { noop } from 'lodash-es';

/**
 * Parent class for plugins that handle stations
 * @param {weblib.utils.Hub} hub Centralized hub
 */
function StationController() {}

StationController.prototype = {
  /* WEB-11055 - ZS -
   * This function basically determines if a POJO is being passed in or a Station object, if it's a
   * POJO, we convert it to a station using the _modelClass func.
   */
  _createStation: function _createStation(attrs) {
    // BB style
    if (attrs && attrs.get) {
      return attrs;
    }
    return new this._modelClass(attrs);
  },
  handleError: function handleError() {
    return Promise.resolve(null);
  },
  handleMetadata: noop,
  loadSeedStation: noop,
  loadStation: noop,
  // 1 for custom, 3 for live, 5 for podcast, 7 for OD
  // this value is combined with the values provided by the playbutton
  // to calculate the actual reportable playedFrom value
  playedFromPrefix: 0,
  stationModel: function stationModel(modelClass) {
    this._modelClass = modelClass;
    return this;
  },
  // Whether skipping is supported
  supportSkip: true,
};

export default StationController;
