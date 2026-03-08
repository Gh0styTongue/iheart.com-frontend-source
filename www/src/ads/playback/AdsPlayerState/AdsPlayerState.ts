import { createContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export enum AdPlaybackState {
  Buffering = 'Buffering',
  Idle = 'Idle',
  Playing = 'Playing',
  Paused = 'Paused',
}

export enum AdMediaType {
  Audio,
  Video,
}

/**
 * AdsPlayerState which downstream components may subscribe to
 */
export type AdsPlayerState = Readonly<{
  /**
   * Represents the type of content an ad is serving
   */
  adMediaType: null | AdMediaType;
  /**
   * True if an ad is currently playing
   */
  adIsPlaying: boolean;
  /**
   * True if an adIsPlaying or is paused
   */
  adIsPresent: boolean;
  /**
   * Playback state of an ad. If Idle, it means there is no ad
   */
  adPlaybackState: AdPlaybackState;
  /**
   * Object representing the duration and progress of an ad
   */
  adTime: null | { duration: number; position: number };
}>;

/**
 * Internal Actions for the AdsPlayer to set state with
 */
export type AdsPlayerActions = Readonly<{
  setAdMediaType: Dispatch<SetStateAction<AdsPlayerState['adMediaType']>>;
  setAdPlaybackState: Dispatch<
    SetStateAction<AdsPlayerState['adPlaybackState']>
  >;
  setAdTime: Dispatch<SetStateAction<AdsPlayerState['adTime']>>;
}>;

export const initialState: AdsPlayerState = {
  adIsPlaying: false,
  adMediaType: null,
  adPlaybackState: AdPlaybackState.Idle,
  adIsPresent: false,
  adTime: null,
};

const initialActions: AdsPlayerActions = {
  setAdMediaType: () => {},
  setAdPlaybackState: () => {},
  setAdTime: () => {},
};

const AdsPlayerStateContext = createContext<[AdsPlayerState, AdsPlayerActions]>(
  [initialState, initialActions],
);

export default AdsPlayerStateContext;
