import { getFollowed } from 'state/Podcast/services';
import {
  getIsAuthenticated,
  getProfileId,
  getSessionId,
} from 'state/Session/selectors';
import { getUserStations } from 'state/Stations/services';
import type { ExtraArgs, ThunkDispatch } from 'state/types';
import type { Podcast } from 'state/Podcast/types';
import type { State } from 'state/buildInitialState';

/**
 * Service for checking follow/favorite status
 * First checks Redux store, then falls back to API if not found
 */
export class FollowStatusService {
  private dispatch: ThunkDispatch | null = null;

  private getState: (() => State) | null = null;

  /**
   * Sets the Redux dispatch and getState functions
   */
  public setConfig(config: {
    dispatch: ThunkDispatch;
    getState: () => State;
  }): void {
    this.dispatch = config.dispatch;
    this.getState = config.getState;
  }

  /**
   * Checks if a podcast is followed by the user
   * First checks Redux store, then fetches from API if not in store
   */
  private async checkPodcastFollowStatus(
    podcastId: string | number,
  ): Promise<boolean> {
    if (!this.dispatch || !this.getState) {
      return false;
    }

    try {
      const state = this.getState();

      // Check if podcast is already in Redux store
      // Podcasts can be stored by id, seedId, or seedShowId after normalization
      const podcastInStore = state?.podcast?.shows?.[String(podcastId)];
      if (podcastInStore?.followed !== undefined) {
        return podcastInStore.followed ?? false;
      }

      // Get authentication data using selectors
      const profileId = getProfileId(state);
      const sessionId = getSessionId(state);
      const isAuthenticated = getIsAuthenticated(state);

      // If not authenticated, cannot check follow status
      if (!isAuthenticated || !profileId || !sessionId) {
        return false;
      }

      // Not in store, fetch from API to get followed podcasts
      const ampUrl =
        state?.config?.urls?.api?.client ||
        state?.config?.urls?.api?.server ||
        'https://api.iheart.com';

      const response = await this.dispatch(
        (
          _dispatch: ThunkDispatch,
          _getState: () => State,
          { transport }: ExtraArgs,
        ) => {
          return transport(
            getFollowed({
              limit: 1000,
              pageKey: '',
              profileId,
              sessionId,
              ampUrl,
            }),
          );
        },
      );

      // Check if the podcast is in the followed list
      const followedPodcasts = (response?.data?.data as Array<Podcast>) || [];
      const followed = followedPodcasts.some(
        podcast => String(podcast.id) === String(podcastId),
      );

      return followed;
    } catch {
      return false;
    }
  }

  /**
   * Checks if a live station is favorited by the user
   * First checks Redux store, then fetches from API if not in store
   */
  private async checkStationFavoriteStatus(
    stationId: string | number,
  ): Promise<boolean> {
    if (!this.dispatch || !this.getState) {
      return false;
    }

    try {
      const state = this.getState();

      // Check if station is already in Redux store
      const stationInStore = state?.live?.stations?.[String(stationId)];
      if (stationInStore?.favorite !== undefined) {
        return stationInStore.favorite || false;
      }

      // Get authentication data using selectors
      const profileId = getProfileId(state);
      const sessionId = getSessionId(state);
      const isAuthenticated = getIsAuthenticated(state);

      // If not authenticated, cannot check favorite status
      if (!isAuthenticated || !profileId || !sessionId) {
        return false;
      }

      // Not in store, fetch user stations from API
      const ampUrl =
        state?.config?.urls?.api?.client ||
        state?.config?.urls?.api?.server ||
        'https://api.iheart.com';

      const response = await this.dispatch(
        (
          _dispatch: ThunkDispatch,
          _getState: () => State,
          { transport }: ExtraArgs,
        ) => {
          return transport(
            getUserStations(ampUrl, profileId, sessionId, profileId, {
              limit: 1000,
            }),
          );
        },
      );

      // Check if the station is in the user's stations list with favorite flag
      const userStations =
        (response?.data?.hits as Array<{
          id: number | string;
          isFavorite?: boolean;
        }>) || [];
      const favorite = userStations.some(
        station =>
          String(station.id) === String(stationId) && station.isFavorite,
      );

      return favorite;
    } catch {
      return false;
    }
  }

  /**
   * Gets the follow/favorite status for a given ID and type
   */
  public async getFollowStatus(
    id: string | number,
    type: 'podcast' | 'station',
  ): Promise<boolean> {
    const isFollowed =
      type === 'podcast' ?
        await this.checkPodcastFollowStatus(id)
      : await this.checkStationFavoriteStatus(id);

    return isFollowed;
  }
}
