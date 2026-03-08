import axios from 'axios';
import logger from 'modules/Logger';
import { getHighlightsApiUrl } from 'state/Config/selectors';
import type { State as ReduxState } from 'state/buildInitialState';

/**
 * Video map status response from Genuin API
 */
export interface VideoMapStatusResponse {
  code: number;
  message: string;
  data: {
    status: boolean;
  };
}

/**
 * Fetches video map status for a station from the Genuin API
 *
 * @param stationId - The station identifier
 * @param state - Redux state to get config from
 * @returns Promise with boolean indicating if video map is available
 */
export async function fetchStationVideoMapStatus({
  stationId,
  state,
}: {
  stationId: number;
  state: ReduxState;
}): Promise<boolean> {
  const highlightsApiUrl = getHighlightsApiUrl(state);
  try {
    const response = await axios.get<VideoMapStatusResponse>(
      `${highlightsApiUrl}/goservices/mediaservices/third_party/video_map_status`,
      {
        params: { station_id: stationId },
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data?.data?.status ?? false;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('VIDEO_MAP_STATUS', err);
    return false;
  }
}

/**
 * Fetches video map status for a podcast from the Genuin API
 *
 * @param podcastId - The podcast identifier
 * @param state - Redux state to get config from
 * @returns Promise with boolean indicating if video map is available
 */
export async function fetchPodcastVideoMapStatus({
  podcastId,
  state,
}: {
  podcastId: number;
  state: ReduxState;
}): Promise<boolean> {
  const highlightsApiUrl = getHighlightsApiUrl(state);
  try {
    const response = await axios.get<VideoMapStatusResponse>(
      `${highlightsApiUrl}/goservices/mediaservices/third_party/video_map_status`,
      {
        params: { podcast_id: podcastId },
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data?.data?.status ?? false;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('VIDEO_MAP_STATUS', err);
    return false;
  }
}
