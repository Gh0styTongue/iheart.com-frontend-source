/*
 * A layer between playerState and a container to pass down
 * player state and currently playing track's props
 */
import hub, { E } from 'shared/utils/Hub';
import PlayerState from 'web-player/PlayerState';
import { Component } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { get } from 'lodash-es';
import { getIsWarmingUp } from 'state/Player/selectors';

const playerState = PlayerState.getInstance();

function getCurrentlyPlaying() {
  const track = playerState.get('track');
  const station = playerState.get('station');
  const tracking = playerState.get('tracking');

  const mediaId = track && track.get('id');
  const uniqueId = track && track.get('uniqueId');
  const playedFrom = tracking && tracking.playedFrom;
  const stationType = station && station.get('seedType');
  const seedId = station && station.get('seedId');
  const stationTrackId =
    get(station, 'currentTrackId') || get(station, ['attrs', 'track', 'id']);

  return {
    mediaId,
    playedFrom,
    seedId,
    stationTrackId,
    stationType,
    uniqueId,
  };
}

function getState(isWarmingUp) {
  return {
    currentlyPlaying: getCurrentlyPlaying(),
    // AV - WEB-11220 - 7/9/18
    // once we get playingState into redux, we should move this into a getVisualPlayingState selector
    // to distinguish between the hoops we jump through to get jw to work and what we want the user to know about.
    // (getPlayingState returns the literal state of jw, and since we start playback with a blank mp3 it mucks things up a bit)
    playingState: isWarmingUp ? 'BUFFERING' : playerState.getPlayingState(),
  };
}

function PlayerStateProxy(WrappedComponent) {
  return connect(createStructuredSelector({ isWarmingUp: getIsWarmingUp }))(
    class extends Component {
      state = getState(this.props.isWarmingUp);

      componentDidMount() {
        this.updateState();
        // This event comes earlier that BUFFERING, use it to change button's state, otherwise the lag
        // between click and buffering ui state is too long. Can't change to buffering on click since it introduces
        // all sorts of race conditions. TODO: Revisit event system of player or add mediaId to STATION_LOADED event's payload.
        hub.on(E.TRACK_CHANGED, this.updateState, this);
        hub.on(E.PLAY_STATE_CHANGED, this.updateState, this);
      }

      componentWillUnmount() {
        hub.off(E.PLAY_STATE_CHANGED, this.updateState, this);
        hub.off(E.TRACK_CHANGED, this.updateState, this);
      }

      updateState = () => {
        this.setState(getState(this.props.isWarmingUp));
      };

      render() {
        return <WrappedComponent {...this.props} {...this.state} />;
      }
    },
  );
}

export default PlayerStateProxy;
