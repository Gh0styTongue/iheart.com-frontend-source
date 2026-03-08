import type { AudioAdProvider } from 'ads/constants';
import type { Card } from 'state/Hero/actions';
import type { HighlightsMetadata } from 'api/highlights';
import type { Location, Market } from 'state/Location/types';
import type { StationTypeValue } from 'constants/stationTypes';

export type Genre = Readonly<{
  display: boolean;
  id: number;
  logo: string;
  name: string;
  sort: number;
}>;

export type Country = Readonly<{
  abbreviation: string;
  id: number | string;
  name: string;
  stationCount?: number;
}>;

export type Filters = Readonly<{
  country: Country | null;
  genre: Genre | null;
  isRequestingStations?: boolean;
  market: Market | null;
}>;

export type LiveTrack = {
  album: string;
  albumId: number;
  artist: string;
  artistId: number;
  dataSource: string;
  endTime: number;
  explicitLyrics: boolean;
  imagePath: string;
  lyricsId: number;
  playbackRights: { onDemand: boolean };
  startTime: number;
  title: string;
  trackDuration: number;
  trackId: number;
};

export type Streams = Readonly<{
  secure_hls_stream: string;
  secure_mp3_pls_stream: string;
  secure_pls_stream: string;
  secure_shoutcast_stream: string;
}>;

export type LiveStation = Readonly<{
  ads: {
    audio_ad_provider: AudioAdProvider;
    provider_id?: string;
    enable_triton_token?: boolean;
  };
  adswizz: {
    adswizzHost: string;
    enableAdswizzTargeting: string;
    publisher_id: string;
  };
  adswizzZones: {
    'audio-exchange-zone': string;
    'audio-fill-zone': string;
    'audio-zone': string;
    'display-zone': string;
    'optimized-audio-fill-zone': string;
  };
  ageLimit: number;
  band: string;
  callLetterAlias: string;
  callLetterRoyalty: string;
  callLetters: string;
  countries: string;
  cume: number;
  description: string;
  esid: string;
  favorite: boolean;
  fccFacilityId: string;
  feeds: {
    feed: string;
    site_id: string;
  };
  format: string;
  freq: string;
  genres: Array<{
    id: number;
    name: string;
    primary: boolean;
    sortIndex: number;
  }>;
  id: number;
  image: string;
  imgWidth: number;
  isActive: boolean;
  leads: Array<Card>;
  logo: string;
  markets: Array<Market>;
  modified: string;
  name: string;
  nowOn: Show;
  playedFrom: string;
  provider: string;
  rawLogo: string;
  rds: string;
  rdsPiCode: string;
  recentlyPlayed?: Array<number>;
  relatedPlaylistIds: Array<string>;
  relatedPodcastIds: Array<string>;
  resolved?: boolean;
  responseType: string;
  retryCount?: number;
  score: number;
  seedId: number;
  seedType: StationTypeValue;
  similars?: Array<string>;
  siteId: string;
  social: {
    facebook?: string;
    instagram?: string;
    pinterest?: string;
    snapchat?: string;
    tiktok?: string;
    twitter?: string;
    youtube?: string;
  };
  stationId: string;
  stationName: string;
  stationSite: string;
  stationType: string;
  streams: Streams;
  thumbs: {
    [a: string]: any;
  };
  thumbsDown?: Array<string>;
  thumbsUp?: Array<string>;
  timeline: Array<TimelineItem>;
  trackIndex?: number;
  type: 'live';
  url: string;
  upcoming: Array<Show>;
  website: string;
  legalLinks: LiveLegalLinks;
  videoMapStatus?: boolean;
}>;

export type adswizzMeta = {
  COMM: { ENG: string };
  comment?: string;
  duration?: null;
  height?: number;
  width?: number;
  url: string;
  title: string;
};

export type spotBlockPlaceHolder = {
  artist: string; // looks like "text=\"Spot Block\" amgTrackId=\"9876543\"" or "text=\"Spot Block End\" amgTrackId=\"9876543\"",
  customData: {
    length: string; // time formatted as "00:00:00",
    show?: string; // this is left off for text=\"Spot Block End\" in the title
  }; // same as title,
  duration: null;
  height: number;
  TIT2: string; // replicates data from custom data, looks like "length=\"00:02:10.895\" show=\"\"",
  title: string;
  TPE1: string;
  url: string;
  width: number;
  WXXX: {
    URL: string; // as url
  };
};

export type musicOrDJOrVieroAd = {
  // DJ spot or music, might also be an ad with associated page ads (narrated by a dj)
  artist: string; // station or segment description, sometimes the same as title,
  customData?: {
    adID?: string;
    amgArtistId: string;
    amgArtworkUrl: string; // image url for content, can be "/",
    amgTrackId: string; // either "-1" or "0",
    cartcutId: string; // viero ad id (sometimes referred to as "synced"),
    hostName: string;
    itunesTrackId: string;
    length: string; // time formatted as "00:00:00",
    MediaBaseId: string; // string of a number id.  "-1" and "0" are permitted but indicate no underlying track,
    playedFrom: any;
    profileId: any;
    song_spot?: SongSpot; // M means music, T means an ad, F means fill song,
    spotInstanceId: string; // no idea, stringified number,
    stationId?: number;
    stationType: string;
    TAID: string; // amp artistId, can be "0" even for song_spot="M" (probably non-ad dj chatter).,
    TPID: string; // no idea,
    unsID: string; // no idea, stringified number
  };
  duration: null;
  height: number;
  TIT2: string; // same as title,
  title: string; // station or segment title.  may also be name of advertiser, but in that case should not be a display string,
  TPE1: string; // same as artist (probably),
  url: string; // replicates data from custom data, looks like: "song_spot=\"T\" MediaBaseId=\"0\" itunesTrackId=\"0\" amgTrackId=\"0\" amgArtistId=\"0\" TAID=\"0\" TPID=\"0\" cartcutId=\"0\" amgArtworkURL=\"\" length=\"00:00:00\" unsID=\"0\" spotInstanceId=\"-1\"",,
  width: number;
  WXXX: {
    URL: string; // looks like url
  };
};

export type LiveMetaData =
  | musicOrDJOrVieroAd
  | spotBlockPlaceHolder
  | adswizzMeta;

// M means music T means an ad,
export enum SongSpot {
  Ad = 'T',
  Music = 'M',
  O = 'O',
}

export type LiveMetaState = {
  adswizzId?: string;
  artistId?: string;
  cartcutId?: string;
  description?: string;
  imageUrl?: string;
  isSpotEnd?: boolean;
  listenerId?: string;
  songSpot?: SongSpot;
  spotInstanceId?: string;
  stationId?: number;
  stationType?: string;
  title?: string;
  trackId?: string;
  type:
    | 'adswizz'
    | 'spotBlock'
    | 'viero'
    | 'music'
    | 'djSpot'
    | 'unhandledCase';
};

export type State = Readonly<{
  highlightsMetadata: HighlightsMetadata | null;
  countryOptions: Array<Location>;
  liveTakeoverWhitelist: Array<string>;
  defaults: {
    cityId?: number;
    cityName?: string;
    marketId?: string;
    marketName?: string;
    stateAbbr?: string;
    stateId?: number;
    stateName?: string;
  };
  filters: Filters;
  genreOptions: {
    [a: string]: Array<Genre>;
  };
  id?: string;
  isRequestingStations?: boolean;
  liveMeta?: LiveMetaState;
  marketOptions: {
    [a: string]: Array<Market>;
  };
  recentlyPlayed?: Array<number>;
  stationLists: {
    [a: string]: Array<string>;
  };
  stations: {
    [a: string]: LiveStation;
  };
}>;

export type Show = {
  coreShowId: number;
  destination: {
    href: string;
    thumbnail: string;
  };
  name: string;
  start: string;
  stop: string;
  stopMs?: number;
  timeUntilShiftChange?: number;
};

export type Lead = Readonly<{
  image: string;
  subtitle: string;
  title: string;
  url: string;
}>;

export type Social = Readonly<{
  sms_number: string;
  request_phone_number: string;
  facebook_switch: boolean;
  facebook_name: string;
  instagram_switch: boolean;
  instagram_name: string;
  pinterest_switch: boolean;
  pinterest_name: string;
  snapchat_switch: boolean;
  snapchat_name: string;
  tiktok: string | undefined;
  tiktok_switch: boolean;
  tiktok_name: string;
  twitter_switch: boolean;
  twitter_name: string;
  youtube_switch: boolean;
  youtube_name: string;
}>;

export type TimelineItem = Readonly<{
  external_url: string;
  feed_vendor?: string;
  img: string;
  is_sponsored: boolean;
  permalink?: string;
  slug?: string;
  title: string;
}>;

export type LiveReportingParams = {
  amgArtistId: string;
  amgTrackId: string;
  amgArtworkURL?: string;
  itunesTrackId: string;
  length: string;
  MediaBaseId: string;
  TAID?: string;
  TPID?: string;
  unsID: string;
};

export type LiveReportingPayload = LiveMetaState &
  LiveReportingParams & {
    adID?: string;
    hostName: string;
    playedFrom: number;
    profileId?: string;
  };

export type TimelineBlock = {
  attributes?: {
    author_name?: string;
    author_url?: string;
    height?: number;
    mimetype?: string;
    thumbnail_height?: number;
    thumbnail_url?: string;
    thumbnail_width?: number;
    type?: string;
    width?: number;
  };
  bucket?: string;
  embed_type: string;
  html?: string;
  id?: string;
  new_tab?: boolean;
  provider?: string;
  rendering_hint?: string;
  schedule?: any;
  title?: string;
  type: string;
  url?: string;
};

export const LEADS = 'LEADS';
export const PUBLISHING = 'PUBLISHING';

export interface TimelineArticle {
  kind: typeof PUBLISHING;
  data: {
    id: string;
    ref_id: string;
    slug: string;
    type: string;
    summary: {
      author: string;
      description: string;
      image: string;
      title: string;
    };
    payload: {
      amp_enabled: boolean;
      apple_news: {
        ref_id: string;
        revision_id: string;
      };
      author: string;
      blocks: Array<TimelineBlock>;
      canonical_url: string;
      cuser: string;
      exclusion: { tags: Array<string> };
      external_url: string;
      fb_allow_comments: boolean;
      feed_content_id: string;
      feed_permalink: string;
      feed_vendor: string;
      include_reccomendations: boolean;
      is_sponsored: boolean;
      keywords: Array<string>;
      primary_image: {
        bucket: string;
        id: string;
      };
      primary_image_uri: string;
      primary_target: {
        categories: Array<string>;
        distribution: Array<string>;
      };
      publish_date: number;
      publish_end_date: number;
      publish_origin: string;
      seo_title: string;
      show_updated_timestamp: string;
      slug: string;
      social_title: string;
      summary: string;
      targets: Array<string>;
      title: string;
      permalink: string;
    };
    subscription: Array<{
      tags: Array<string>;
    }>;
    exclusion: Array<{
      tags: Array<string>;
    }>;
    pub_start: number;
    pub_until: number;
    pub_changed: number;
  };
}

export interface TimelineLead {
  kind: typeof LEADS;
  data: {
    id: string;
    exclusion: { tags: Array<string> };
    important: boolean;
    position: number;
    priority: number;
    range: {
      begin: number;
      end: number;
    };
    targets: Array<{ tags: Array<string> }>;
    img_uri: string;
    background_color: string;
    catalog?: string;
    img_meta: {
      base_id: string;
      bucket: string;
      ops: Array<any>;
    };
    link: {
      description: string;
      name: string;
      target: string;
      urls: {
        mobile: string;
        web: string;
      };
    };
    subtitle: string;
    title: string;
    use_catalog_image: boolean;
  };
}

export type TimelineResult = TimelineArticle | TimelineLead;

export type TimelineResultKind = TimelineResult['kind'];

type Key = string | number | symbol;

type KindMap<T, U extends Key> = {
  [K in U]: T extends { kind: K } ? T : never;
};

export type PatternMatch<T, U extends Key, R> = {
  [K in keyof KindMap<T, U>]: (result: KindMap<T, U>[K]) => R;
};

export type LiveProfileResponse = {
  data: {
    sites: {
      find: {
        config: {
          podcasts: {
            general: {
              default_podcasts: Array<string>;
            };
          };
          playlists: {
            general: {
              default_playlists: Array<string>;
            };
          };
          contact: {
            request_phone_number: string;
            sms_number: string;
          };
          design: {
            hero_color: string;
            hero_image: string;
          };
          leads: {
            results?: Array<{
              data: Card;
            }>;
          };
          social: {
            facebook_name: string;
            facebook_switch: boolean;
            instagram_name: string;
            instagram_switch: boolean;
            pinterest_name: string;
            pinterest_switch: boolean;
            snapchat_name: string;
            snapchat_switch: boolean;
            tiktok_name: string;
            tiktok_switch: boolean;
            twitter_name: string;
            twitter_switch: boolean;
            youtube_name: string;
            youtube_switch: boolean;
          };
          timeline: {
            results?: Array<TimelineResult>;
          };
        };
        onAirSchedule: {
          current: Show;
          upcoming: Array<Show>;
        };
        canonicalHostname: string;
        integration: {
          data: {
            broadcastFacilities: Array<{
              broadcastBand: string;
              broadcastCallLetters: string;
              politicalLinkOverride: string | null;
            }>;
          };
        };
        liveConfig: {
          sections: {
            navigation: {
              contest_nav_switch: boolean;
            };
            contact: {
              eeo_report_asset: {
                asset: {
                  href: string;
                };
              };
            };
          };
        };
      };
    };
  };
};

export type LiveLegalLinks = {
  facilities: {
    AM?: {
      public: string;
      political: string;
      callLetters: string;
    };
    FM?: {
      public: string;
      political: string;
      callLetters: string;
    };
  } | null;
  assistance: string | null;
  contestRules: string | null;
  EEOPublicFile: string | null;
};
export type UpdatedProfileResponse = {
  config: {
    podcasts: {
      general: {
        default_podcasts: Array<string>;
      };
    };
    playlists: {
      general: {
        default_playlists: Array<string>;
      };
    };
  };
  current: Show;
  hero: {
    background: string;
    image: string;
  };
  leads: Array<Card>;
  social: Social;
  timeline: Array<TimelineItem>;
  timeUntilShiftChange?: number;
  upcoming: Array<Show>;
  legalLinks: LiveLegalLinks;
};
