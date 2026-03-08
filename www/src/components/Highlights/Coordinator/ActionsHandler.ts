import { toggleFavoriteStation } from 'state/Live/actions';
import { updateFollowed } from 'state/Podcast/actions';

import {
  showFavoriteChangedGrowl,
  showFollowedChangedGrowl,
} from 'state/UI/actions';
import type { FollowPayloadType, ReduxDispatch } from './types';
import type { StateManager } from './StateManager';

/**
 * Handles Redux actions triggered by Highlights SDK events.
 * Manages Follow/Unfollow and Favorite/Unfavorite interactions.
 */
export class ActionsHandler {
  private dispatch: ReduxDispatch | null = null;

  private stateManager?: StateManager;

  /**
   * Sets the Redux dispatch function for dispatching actions
   */
  public setDispatch(dispatch: ReduxDispatch): void {
    this.dispatch = dispatch;
  }

  /**
   * Sets the state manager for accessing player state
   */
  public setStateManager(stateManager: StateManager): void {
    this.stateManager = stateManager;
  }

  /**
   * Handles follow/unfollow events from Highlights SDK.
   * Dispatches updateFollowed action to Redux store and tracks analytics with highlights context.
   */
  public handleFollow(payload: FollowPayloadType): void {
    if (!this.dispatch) {
      return;
    }
    const {
      payload: { isFollowed, id, type, name },
    } = payload;

    // Determine if this is from full screen player based on expand view state
    const isFullScreenPlayer =
      this.stateManager?.get('expandViewOpen') ?? false;

    // Determine view.pageName based on content type and player state
    let viewPageName: string;
    if (isFullScreenPlayer) {
      viewPageName =
        type === 'podcast' ?
          'podcast_highlights_fullscreen'
        : 'live_highlights_fullscreen';
    } else {
      viewPageName = type === 'podcast' ? 'podcast_profile' : 'live_profile';
    }

    // Build view data for analytics
    const view = {
      pageName: viewPageName,
      tab: 'highlights',
    };

    if (type === 'podcast') {
      this.dispatch(updateFollowed({ followed: isFollowed, seedId: id, view }));
      this.dispatch(
        showFollowedChangedGrowl({
          isFollowed,
          name,
        }),
      );
    } else {
      this.dispatch(toggleFavoriteStation({ stationId: id, view }));
      this.dispatch(
        showFavoriteChangedGrowl({
          isFavorite: isFollowed,
          name,
        }),
      );
    }
  }

  /**
   * Cleans up the dispatch reference
   */
  public cleanup(): void {
    this.dispatch = null;
    this.stateManager = undefined;
  }
}
