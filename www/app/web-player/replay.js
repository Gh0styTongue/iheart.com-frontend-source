import logger, { CONTEXTS } from 'modules/Logger';
import { isModel } from 'utils/immutable';
import { merge } from 'lodash-es';

const defaultState = [null, null, null];

class ReplayStore {
  constructor() {
    this.reset();
  }

  update(track, station) {
    if (!track || !isModel(track)) {
      const errObj = new Error(
        'replay store expects a track as a model when updating',
      );
      logger.error(CONTEXTS.MY_MUSIC, errObj.message, {}, errObj);
      return null;
    }

    const replayableTracks = this.state;
    const isReplay = track.get('isReplay');
    const newTrackId = track.get('id');
    const newStation = merge({}, station, { track: null });
    const newTrack = merge({}, track.set('replayStation', newStation));
    // when playing a new track, add to the list
    // filter any possible duplicates, either from replay or playing the same track twice
    let newReplayableTracks = [
      ...replayableTracks.filter(t => !t || t.get('id') !== newTrackId),
      null,
    ];

    // if we're not replaying and a valid trackId exists, place the new track at the top
    if (!isReplay && newTrack.get('id') > -1) {
      newReplayableTracks = [newTrack, ...newReplayableTracks];
    }

    // make sure there's never more than 3 while always filling the blank of a possible removal
    this.state = newReplayableTracks.slice(0, 3);

    return null;
  }

  reset() {
    this.state = defaultState;
  }

  getState() {
    return this.state;
  }
}

const replayStore = new ReplayStore();

export default replayStore;
