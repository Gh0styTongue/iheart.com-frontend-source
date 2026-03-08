import type {
  GlobalTargetingValues,
  PageTargetingValues,
  PlayerTargetingValues,
} from './types';
import type { PageInfo } from '../types';

export const DEFAULT_PAGE_INFO: PageInfo = {
  routeKey: null,
  pageId: null,
  pageType: null,
  model: {},
  keywords: null, // TODO: Is this correct?
  topics: null,
  artist_id: null,
  adCampaign: null,
  feed_id: null,
  params: {},
  subcategory: null,
};

export const DEFAULT_PAGE_TARGETING_VALUES: Required<PageTargetingValues> = {
  seed: null,
  name: null,
  ccrcontent1: null,
  modelId: null,
  ccrcontent3: null,
  format: null,
  pageformat: null,
  market: null,
  pagemarket: null,
  artistId: null,
  campaign: null,
  contentcategory: null,
  contentdetail: null,
  contenttype: null,
  section: null,
  'aw_0_1st.ihmgenre': null,
  'aw_0_1st.playlistid': null,
  'aw_0_1st.playlisttype': null,
};

export const DEFAULT_PLAYER_TARGETING_VALUES: Required<PlayerTargetingValues> =
  {
    locale: null,
    seed: null,
    ccrcontent2: null,
    ccrformat: null,
    ccrmarket: null,
    provider: null,
    playedfrom: null,
  };

export const DEFAULT_USER_TARGETING_VALUES: GlobalTargetingValues = {
  accountType: null,
  age: null,
  country: null,
  env: null,
  gender: null,
  profileId: null,
  visitNum: null,
  zip: null,
};

export enum TargetingKeys {
  IHMGENRE = 'aw_0_1st.ihmgenre',
  PLAYLISTID = 'aw_0_1st.playlistid',
  PLAYLISTTYPE = 'aw_0_1st.playlisttype',
}
