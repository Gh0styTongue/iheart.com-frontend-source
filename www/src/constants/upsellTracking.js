const UPSELL = {};

const PLAYER_UPSELL_CONTENT_TYPE = 'upsell player';
const PLAYER_UPSELL_FLOW = 'ihr:upsell:player';
const ARTIST_UPSELL_CONTENT_TYPE = 'upsell artist';
const ARTIST_UPSELL_FLOW = 'ihr:upsell:artist';
const ALBUM_UPSELL_CONTENT_TYPE = 'upsell album';
const ALBUM_UPSELL_FLOW = 'ihr:upsell:album';
const MY_MUSIC_UPSELL_CONTENT_TYPE = 'upsell my music';
const MY_MUSIC_UPSELL_FLOW = 'ihr:upsell:my:music';
const CURATED_PLAYLIST_UPSELL_CONTENT_TYPE = 'upsell playlist';
const PLAYLIST_UPSELL_FLOW = 'ihr:upsell:playlist';
const SHARED_USER_PLAYLIST_UPSELL_CONTENT_TYPE = 'upsell shared user playlist';
const PLAYLIST_RADIO_UPSELL_CONTENT_TYPE = 'upsell playlist radio';
const NEW4U_RADIO_UPSELL_CONTENT_TYPE = 'upsell new4u radio';
const SHARED_USER_PLAYLIST_UPSELL_FLOW =
  'ihr:upsell:shared_user_playlist_upgrade_banner';
const PLAYLIST_RADIO_UPSELL_FLOW = 'ihr:upsell:playlist_radio_upgrade_banner';
const FOR_YOU_UPSELL_CONTENT_TYPE = 'upsell for you';
const FOR_YOU_UPSELL_FLOW = 'ihr:upsell:foryou';
const HEADER_UPSELL_CONTENT_TYPE = 'upsell header';
const HEADER_UPSELL_FLOW = 'ihr:upsell:header';
const SIDE_NAV_UPSELL_CONTENT_TYPE = 'upsell side nav';
const SIDE_NAV_UPSELL_FLOW = 'ihr:upsell:sidenav';
const DEEPLINK_UPSELL_CONTENT_TYPE = 'upsell deeplink';
const DEEPLINK_UPSELL_FLOW = 'ihr:upsell:deeplink';
const SETTINGS_UPSELL_CONTENT_TYPE = 'upsell settings';
const SETTINGS_UPSELL_FLOW = 'ihr:upsell:settings';
const HELP_SITE_UPSELL_CONTENT_TYPE = 'upsell help site';
const HELP_SITE_UPSELL_FLOW = 'ihr:upsell:help_site';
const LOCAL_SITE_UPSELL_CONTENT_TYPE = 'upsell local site';
const LOCAL_SITE_UPSELL_FLOW = 'ihr:upsell:local_site';
const CARE_TICKET_UPSELL_CONTENT_TYPE = 'upsell care ticket';
const CARE_TICKET_UPSELL_FLOW = 'ihr:upsell:care_ticket';
const AD_CONTENT_TYPE = 'upsell ad';
const AD_FLOW = 'ihr:upsell:ad';
const EMAIL_CONTENT_TYPE = 'upsell email';
const EMAIL_FLOW = 'ihr:upsell:email';
const PUSH_CONTENT_TYPE = 'upsell push';
const PUSH_FLOW = 'ihr:upsell:push';
const EMAIL_PLUS_WIN_BACK_CONTENT_TYPE = 'upsell plus win back email';
const EMAIL_PLUS_WIN_BACK_FLOW = 'ihr:upsell:email_plus_win_back';
const EMAIL_PREMIUM_WIN_BACK_CONTENT_TYPE = 'upsell premium win back email';
const EMAIL_PREMIUM_WIN_BACK_FLOW = 'ihr:upsell:email_premium_win_back';

// playlist radio upsells

UPSELL.PLAYLIST_RADIO_SHUFFLE = {
  contentType: 'playlist radio shuffle',
  flow: 'ihr:upsell:playlist_radio_shuffle',
  id: 113,
  name: 'playlist_radio_shuffle',
  pageName: 'ihr:upsell:playlist_radio_shuffle',
};

UPSELL.PLAYLIST_RADIO_SAVE_PLAYLIST = {
  contentType: 'playlist radio save playlist',
  flow: 'ihr:upsell:playlist_radio_save_playlist',
  id: 110,
  name: 'playlist_radio_save_playlist',
  pageName: 'ihr:upsell:playlist_radio_save_playlist',
};

UPSELL.FREE_PLAYLIST_DUPLICATE_TRACK = {
  contentType: 'free playlist add duplicate track',
  flow: 'ihr:upsell:free_playlist_add_duplicate',
  id: 111,
  name: 'free_playlist_add_duplicate',
  pageName: 'ihr:upsell:free_playlist_add_duplicate',
};

UPSELL.NEW4U_RADIO_SHUFFLE = {
  contentType: 'new4u radio shuffle',
  flow: 'ihr:upsell:new4u_radio_shuffle',
  id: 118,
  name: 'new4u_radio_shuffle',
  pageName: 'ihr:upsell:new4u_radio_shuffle',
};

UPSELL.NEW4U_RADIO_SAVE_PLAYLIST = {
  contentType: 'new4u radio save playlist',
  flow: 'ihr:upsell:new4u_radio_save_playlist',
  id: 115,
  name: 'new4u_radio_save_playlist',
  pageName: 'ihr:upsell:new4u_radio_save_playlist',
};

// player upsells

UPSELL.SKIP_LIMIT = {
  contentType: PLAYER_UPSELL_CONTENT_TYPE,
  flow: PLAYER_UPSELL_FLOW,
  id: 201,
  name: 'skip_limit',
  pageName: `${PLAYER_UPSELL_FLOW}:skip_limit`,
};

UPSELL.CUSTOM_RADIO_ADD_TO_PLAYLIST = {
  contentType: PLAYER_UPSELL_CONTENT_TYPE,
  flow: PLAYER_UPSELL_FLOW,
  id: 203,
  name: 'custom_radio_add_to_playlist',
  pageName: `${PLAYER_UPSELL_FLOW}:add_to_playlist`,
};

UPSELL.LIVE_RADIO_ADD_TO_PLAYLIST = {
  contentType: PLAYER_UPSELL_CONTENT_TYPE,
  flow: PLAYER_UPSELL_FLOW,
  id: 205,
  name: 'live_radio_add_to_playlist',
  pageName: `${PLAYER_UPSELL_FLOW}:add_to_playlist`,
};

UPSELL.CUSTOM_RADIO_REPLAY = {
  contentType: PLAYER_UPSELL_CONTENT_TYPE,
  flow: PLAYER_UPSELL_FLOW,
  id: 202,
  name: 'custom_radio_replay',
  pageName: `${PLAYER_UPSELL_FLOW}:replay`,
};

UPSELL.LIVE_RADIO_REPLAY = {
  contentType: PLAYER_UPSELL_CONTENT_TYPE,
  flow: PLAYER_UPSELL_FLOW,
  id: 204,
  name: 'live_radio_replay',
  pageName: `${PLAYER_UPSELL_FLOW}:replay`,
};

// my music upsells

UPSELL.MY_MUSIC_SONGS_TILE = {
  contentType: MY_MUSIC_UPSELL_CONTENT_TYPE,
  flow: MY_MUSIC_UPSELL_FLOW,
  id: 207,
  name: 'my_music_songs_tile',
  pageName: `${MY_MUSIC_UPSELL_FLOW}:songs_tile`,
};

UPSELL.MY_MUSIC_ALBUMS_TILE = {
  contentType: MY_MUSIC_UPSELL_CONTENT_TYPE,
  flow: MY_MUSIC_UPSELL_FLOW,
  id: 208,
  name: 'my_music_albums_tile',
  pageName: `${MY_MUSIC_UPSELL_FLOW}:albums_tile`,
};

UPSELL.MY_MUSIC_ARTISTS_TILE = {
  contentType: MY_MUSIC_UPSELL_CONTENT_TYPE,
  flow: MY_MUSIC_UPSELL_FLOW,
  id: 209,
  name: 'my_music_artists_tile',
  pageName: `${MY_MUSIC_UPSELL_FLOW}:artists_tile`,
};

UPSELL.MY_MUSIC_CREATE_NEW_PLAYLIST = {
  contentType: MY_MUSIC_UPSELL_CONTENT_TYPE,
  flow: MY_MUSIC_UPSELL_FLOW,
  id: 210,
  name: 'my_music_create_new_playlist',
  pageName: `${MY_MUSIC_UPSELL_FLOW}:create_new_playlist`,
};

// artist profile upsells

UPSELL.ARTIST_TOP_SONG_SAVE_TO_MY_MUSIC = {
  contentType: ARTIST_UPSELL_CONTENT_TYPE,
  flow: ARTIST_UPSELL_FLOW,
  id: 228,
  name: 'artist_top_song_save_to_my_music',
  pageName: `${ARTIST_UPSELL_FLOW}:top_song:save_song`,
};

UPSELL.ARTIST_TOP_SONG_ADD_TO_PLAYLIST = {
  contentType: ARTIST_UPSELL_CONTENT_TYPE,
  flow: ARTIST_UPSELL_FLOW,
  id: 229,
  name: 'artist_top_song_add_to_playlist',
  pageName: `${ARTIST_UPSELL_FLOW}:top_song:add_to_playlist`,
};

UPSELL.ARTIST_ALBUMS_SAVE_ALBUM = {
  contentType: ARTIST_UPSELL_CONTENT_TYPE,
  flow: ARTIST_UPSELL_FLOW,
  id: 222,
  name: 'artist_albums_save_album',
  pageName: `${ARTIST_UPSELL_FLOW}:albums:save_album`,
};

UPSELL.ARTIST_ALBUMS_ADD_ALBUM_TO_PLAYLIST = {
  contentType: ARTIST_UPSELL_CONTENT_TYPE,
  flow: ARTIST_UPSELL_FLOW,
  id: 223,
  name: 'artist_albums_add_album_to_playlist',
  pageName: `${ARTIST_UPSELL_FLOW}:albums:add_album_to_playlist`,
};

// album upsells

UPSELL.ALBUM_HEADER_PLAY = {
  contentType: ALBUM_UPSELL_CONTENT_TYPE,
  flow: ALBUM_UPSELL_FLOW,
  id: 221,
  name: 'album_header_play',
  pageName: `${ALBUM_UPSELL_FLOW}:header_play`,
};

UPSELL.ALBUM_SAVE_SONG = {
  contentType: ALBUM_UPSELL_CONTENT_TYPE,
  flow: ALBUM_UPSELL_FLOW,
  id: 224,
  name: 'album_save_song',
  pageName: `${ALBUM_UPSELL_FLOW}:save_song`,
};

UPSELL.ALBUM_ADD_TO_PLAYLIST = {
  contentType: ALBUM_UPSELL_CONTENT_TYPE,
  flow: ALBUM_UPSELL_FLOW,
  id: 225,
  name: 'album_add_to_playlist',
  pageName: `${ALBUM_UPSELL_FLOW}:add_to_playlist`,
};

UPSELL.ALBUM_SAVE_ALBUM_TO_MY_MUSIC = {
  contentType: ALBUM_UPSELL_CONTENT_TYPE,
  flow: ALBUM_UPSELL_FLOW,
  id: 226,
  name: 'album_save_album_to_my_music',
  pageName: `${ALBUM_UPSELL_FLOW}:save_albums_to_my_music`,
};

UPSELL.ALBUM_ADD_ALBUM_TO_PLAYLIST = {
  contentType: ALBUM_UPSELL_CONTENT_TYPE,
  flow: ALBUM_UPSELL_FLOW,
  id: 227,
  name: 'album_add_album_to_playlist',
  pageName: `${ALBUM_UPSELL_FLOW}:add_album_to_playlist`,
};

UPSELL.IHR_AD_99_CENTS = {
  contentType: 'upsell 99 cents',
  flow: 'ihr:upsell:ihr_ad_99_cents',
  id: 247,
  name: 'ihr_ad_99_cents',
  pageName: 'ihr:upsell:ihr_ad_99_cents',
};

UPSELL.SOCIAL_MEDIA_99_CENTS = {
  contentType: 'upsell 99 cents',
  flow: 'ihr:upsell:social_media_99_cents',
  id: 248,
  name: 'social_media_99_cents',
  pageName: 'ihr:upsell:social_media_99_cents',
};

UPSELL.PAID_99_CENTS = {
  contentType: 'upsell 99 cents',
  flow: 'ihr:upsell:paid_99_cents',
  id: 249,
  name: 'paid_99_cents',
  pageName: 'ihr:upsell:paid_99_cents',
};

UPSELL.LOCAL_99_CENTS = {
  contentType: 'upsell 99 cents',
  flow: 'ihr:upsell:local_99_cents',
  id: 250,
  name: 'local_99_cents',
  pageName: 'ihr:upsell:local_99_cents',
};

UPSELL.HERO_99_CENTS = {
  contentType: 'upsell 99 cents',
  flow: 'ihr:upsell:hero_99_cents',
  id: 251,
  name: 'hero_99_cents',
  pageName: 'ihr:upsell:hero_99_cents',
};

UPSELL.HERO_PLUS = {
  contentType: 'upsell hero',
  flow: 'ihr:upsell:hero',
  id: 160,
  name: 'hero',
  pageName: 'ihr:upsell:hero',
};

UPSELL.HERO_PREMIUM = {
  contentType: 'upsell hero',
  flow: 'ihr:upsell:hero',
  id: 260,
  name: 'hero',
  pageName: 'ihr:upsell:hero',
};

UPSELL.HERO = {
  contentType: 'upsell hero',
  flow: 'ihr:upsell:hero',
  id: 360,
  name: 'hero',
  pageName: 'ihr:upsell:hero',
};

UPSELL.EMAIL_RESET_PASSWORD_PLUS = {
  contentType: 'upsell email reset password',
  flow: 'ihr:upsell:email_reset_password',
  id: 162,
  name: 'email_reset_password',
  pageName: 'ihr:upsell:email_reset_password',
};

UPSELL.EMAIL_RESET_PASSWORD_PREMIUM = {
  contentType: 'upsell email reset password',
  flow: 'ihr:upsell:email_reset_password',
  id: 262,
  name: 'email_reset_password',
  pageName: 'ihr:upsell:email_reset_password',
};

// 99cent promos

UPSELL.EMAIL_NINETY_NINE_CENTS = {
  contentType: 'upsell 99 cents',
  flow: 'ihr:upsell:email_99_cents',
  id: 277,
  name: 'email_99_cents',
  pageName: 'ihr:upsell:email_99_cents',
};

UPSELL.IN_BROWSER_NINETY_NINE_CENTS = {
  contentType: 'upsell 99 cents',
  flow: 'ihr:upsell:in_browser_99_cents',
  id: 279,
  name: 'in_browser_99_cents',
  pageName: 'ihr:upsell:in_browser_99_cents',
};

UPSELL.NINETY_NINE_CENTS_INELIGIBLE = {
  contentType: 'upsell 99 cents ineligible',
  flow: 'ihr:upsell:99_cents_ineligible',
  id: 280,
  name: '99_cents_ineligible',
  pageName: 'ihr:upsell:99_cents_ineligible',
};

UPSELL.AFFILIATE_SITE_PLUS = {
  contentType: 'upsell affiliate site',
  flow: 'ihr:upsell:affiliate_site',
  id: 172,
  name: 'affiliate_site',
  pageName: 'ihr:upsell:affiliate_site',
};
UPSELL.AFFILIATE_SITE_ALL_ACCESS = {
  contentType: 'upsell affiliate site',
  flow: 'ihr:upsell:affiliate_site',
  id: 272,
  name: 'affiliate_site',
  pageName: 'ihr:upsell:affiliate_site',
};
UPSELL.AFFILIATE_SITE_BOTH = {
  contentType: 'upsell affiliate site',
  flow: 'ihr:upsell:affiliate_site',
  id: 372,
  name: 'affiliate_site',
  pageName: 'ihr:upsell:affiliate_site',
};

// banners

UPSELL.CURATED_PLAYLIST_UPGRADE_BANNER = {
  contentType: CURATED_PLAYLIST_UPSELL_CONTENT_TYPE,
  flow: PLAYLIST_UPSELL_FLOW,
  id: 312,
  name: 'curated_playlist_upgrade_banner',
  pageName: `${PLAYLIST_UPSELL_FLOW}:curated_playlist_upgrade_banner`,
};

UPSELL.SHARED_USER_PLAYLIST_UPGRADE_BANNER = {
  contentType: SHARED_USER_PLAYLIST_UPSELL_CONTENT_TYPE,
  flow: SHARED_USER_PLAYLIST_UPSELL_FLOW,
  id: 363,
  name: 'shared_user_playlist_upgrade_banner',
  pageName: SHARED_USER_PLAYLIST_UPSELL_FLOW,
};

UPSELL.PLAYLIST_RADIO_UPGRADE_BANNER = {
  contentType: PLAYLIST_RADIO_UPSELL_CONTENT_TYPE,
  flow: PLAYLIST_RADIO_UPSELL_FLOW,
  id: 109,
  name: 'playlist_radio_upgrade_banner',
  pageName: PLAYLIST_RADIO_UPSELL_FLOW,
};

UPSELL.MY_PLAYLIST_UPGRADE_BANNER = {
  contentType: CURATED_PLAYLIST_UPSELL_CONTENT_TYPE,
  flow: PLAYLIST_UPSELL_FLOW,
  id: 338,
  name: 'my_playlist_upgrade_banner',
  pageName: `${PLAYLIST_UPSELL_FLOW}:my_playlist_upgrade_banner`,
};

UPSELL.NEW4U_UPGRADE_BANNER = {
  contentType: NEW4U_RADIO_UPSELL_CONTENT_TYPE,
  flow: PLAYLIST_UPSELL_FLOW,
  id: 114,
  name: 'new_for_you_radio_upgrade_banner',
  pageName: `${PLAYLIST_UPSELL_FLOW}:new4u_upgrade_banner`,
};

UPSELL.HEADER_UPGRADE_BUTTON = {
  contentType: HEADER_UPSELL_CONTENT_TYPE,
  flow: HEADER_UPSELL_FLOW,
  id: 354,
  name: 'header_upgrade_button',
  pageName: `${HEADER_UPSELL_FLOW}:header_upgrade_button`,
};

UPSELL.SIDE_NAV_UPGRADE_BUTTON = {
  contentType: SIDE_NAV_UPSELL_CONTENT_TYPE,
  flow: SIDE_NAV_UPSELL_FLOW,
  id: 54,
  name: 'side_nav_upgrade_button',
  pageName: `${SIDE_NAV_UPSELL_FLOW}:side_nav_upgrade_button`,
};

UPSELL.MY_MUSIC_UPSELL_BANNER = {
  contentType: MY_MUSIC_UPSELL_CONTENT_TYPE,
  flow: MY_MUSIC_UPSELL_FLOW,
  id: 306,
  name: 'my_music_upsell_banner',
  pageName: `${MY_MUSIC_UPSELL_FLOW}:my_music_upsell_banner`,
};

UPSELL.FOR_YOU_UPGRADE_BANNER = {
  contentType: FOR_YOU_UPSELL_CONTENT_TYPE,
  flow: FOR_YOU_UPSELL_FLOW,
  id: 335,
  name: 'for_you_upgrade_banner',
  pageName: `${FOR_YOU_UPSELL_FLOW}:for_you_upgrade_banner`,
};

UPSELL.DEEPLINK = {
  contentType: DEEPLINK_UPSELL_CONTENT_TYPE,
  flow: DEEPLINK_UPSELL_FLOW,
  id: 311,
  name: '(unknown)/Deeplink', // this should get overwritten with the actual referrer
  pageName: DEEPLINK_UPSELL_FLOW,
};

// settings upsells

UPSELL.SETTINGS_SUBSCRIPTION_LEARN_MORE = {
  contentType: SETTINGS_UPSELL_CONTENT_TYPE,
  flow: SETTINGS_UPSELL_FLOW,
  id: 334,
  name: 'settings_subscription_learn_more',
  pageName: `${SETTINGS_UPSELL_FLOW}:settings_subscription_learn_more`,
};

UPSELL.SETTINGS_SUBSCRIPTION_SUBSCRIBE_AGAIN = {
  contentType: SETTINGS_UPSELL_CONTENT_TYPE,
  flow: SETTINGS_UPSELL_FLOW,
  id: 357,
  name: 'settings_subscription_subscribe_again',
  pageName: `${SETTINGS_UPSELL_FLOW}:settings_subscription_subscribe_again`,
};

// help/local upsells

UPSELL.HELP_SITE = {
  contentType: HELP_SITE_UPSELL_CONTENT_TYPE,
  flow: HELP_SITE_UPSELL_FLOW,
  id: 333,
  name: 'help_site',
  pageName: HELP_SITE_UPSELL_FLOW,
};

UPSELL.LOCAL_SITE = {
  contentType: LOCAL_SITE_UPSELL_CONTENT_TYPE,
  flow: LOCAL_SITE_UPSELL_FLOW,
  id: 352,
  name: 'local_site',
  pageName: LOCAL_SITE_UPSELL_FLOW,
};

UPSELL.CARE_TICKET = {
  contentType: CARE_TICKET_UPSELL_CONTENT_TYPE,
  flow: CARE_TICKET_UPSELL_FLOW,
  id: 358,
  name: 'care_ticket',
  pageName: CARE_TICKET_UPSELL_FLOW,
};

UPSELL.IN_STREAM_CUSTOM_AD = {
  contentType: PLAYER_UPSELL_CONTENT_TYPE,
  flow: PLAYER_UPSELL_FLOW,
  id: 267,
  name: 'custom_radio_in-stream_audio_ad',
  pageName: `${PLAYER_UPSELL_FLOW}:in-stream_audio_ad`,
};

// ad

UPSELL.AD = {
  contentType: AD_CONTENT_TYPE,
  flow: AD_FLOW,
  id: 359,
  name: 'ad',
  pageName: AD_FLOW,
};

// email/push/win-back

UPSELL.EMAIL = {
  contentType: EMAIL_CONTENT_TYPE,
  flow: EMAIL_FLOW,
  id: 364,
  name: 'email',
  pageName: EMAIL_FLOW,
};

UPSELL.PUSH = {
  contentType: PUSH_CONTENT_TYPE,
  flow: PUSH_FLOW,
  id: 320,
  name: 'push',
  pageName: PUSH_FLOW,
};

UPSELL.EMAIL_PLUS_WIN_BACK = {
  contentType: EMAIL_PLUS_WIN_BACK_CONTENT_TYPE,
  flow: EMAIL_PLUS_WIN_BACK_FLOW,
  id: 365,
  name: 'email_plus_win_back',
  pageName: EMAIL_PLUS_WIN_BACK_FLOW,
};

UPSELL.EMAIL_PREMIUM_WIN_BACK = {
  contentType: EMAIL_PREMIUM_WIN_BACK_CONTENT_TYPE,
  flow: EMAIL_PREMIUM_WIN_BACK_FLOW,
  id: 366,
  name: 'email_premium_win_back',
  pageName: EMAIL_PREMIUM_WIN_BACK_FLOW,
};

UPSELL.PLAYLIST_RADIO_SONG2START = {
  id: 122,
};

UPSELL.HOMEPAGE_PLUS_SUBSCRIPTION = {
  id: 129,
  name: 'homepage_plus_subscription',
};

UPSELL.HOMEPAGE_PREMIUM_SUBSCRIPTION = {
  id: 130,
  name: 'homepage_premium_subscription',
};

export function getUpsellById(id) {
  return Object.keys(UPSELL)
    .map(key => UPSELL[key])
    .find(u => u.id === id);
}

export default UPSELL;
