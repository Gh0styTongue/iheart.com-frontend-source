import axios from 'axios';
import logger from 'modules/Logger';
import { getHighlightsApiUrl } from 'state/Config/selectors';
import type { State as ReduxState } from 'state/buildInitialState';

/**
 * Highlights API Metadata Types
 *
 * type: 1 -> profile
 * type: 2 -> community
 * type: 3 -> loop
 * type: 4 -> video/clip
 * type: 5 -> brand landing page (subdomain or white label)
 * type: 6 -> brand slug (subdomain or white label)
 */
enum MetadataType {
  Profile = 1,
  Community = 2,
  Loop = 3,
  VideoClip = 4,
  BrandLandingPage = 5,
  BrandSlug = 6,
}

/**
 * Metadata payload structure for Genuin API
 */
type MetadataPayload = Partial<{
  brand_id: number;
  username: string;
  slug: string;
  domain: string;
  subdomain: string;
  share_image_id: number;
  uuid: string;
}> & {
  type: number;
};

/**
 * Clip metadata structure from Genuin API
 * This is the direct response after extracting json.data
 */
export interface HighlightsMetadata {
  title?: string;
  description?: string;
  image?: string;
  preview_image?: string;
  error?: string;
  // Add more fields as needed based on actual API response
}

/**
 * Fetches clip metadata from the Genuin API
 *
 * @param clipId - The clip identifier extracted from the slug
 * @param state - Redux state to get config from
 * @returns Promise with metadata response from the API
 */
export async function fetchHighlightsMetadata({
  clipId,
  state,
}: {
  clipId: string;
  state: ReduxState;
}): Promise<HighlightsMetadata> {
  const highlightsApiUrl = getHighlightsApiUrl(state);
  try {
    const IHEART_BRAND_ID = 1729; // iHeartMedia brand ID for highlights API

    const params: MetadataPayload = {
      type: MetadataType.VideoClip,
      uuid: clipId,
      brand_id: IHEART_BRAND_ID,
    };

    const response = await axios.get(
      `${highlightsApiUrl}/api/v3/web/meta_data`,
      {
        params,
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.data || {};
  } catch (error) {
    logger.error('Error fetching clip metadata:', error);
    return { error: 'Failed to fetch clip metadata' };
  }
}
