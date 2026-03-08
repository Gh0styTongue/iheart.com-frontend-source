export enum PlaybackAdTypes {
  LivePrerolls = 'LivePrerolls',
  CustomPrerolls = 'CustomPrerolls',
  CustomInStreamAd = 'CustomInStreamAd',
}

// TODO: This will eventually be accessible from @iheartradio/web.api
export enum AdsStationTypes {
  Track = 'TRACK',
  Collection = 'COLLECTION',
  Artist = 'ARTIST',
  TalkShow = 'TALKSHOW',
  TalkTheme = 'TALKTHEME',
  Live = 'LIVE',
  N4u = 'N4U',
  Radio = 'RADIO',
  Talk = 'TALK',
  Clip = 'CLIP',
  Favorites = 'FAVORITES',
  Podcast = 'PODCAST',
}

export enum TargetingStationTypes {
  Artist = 'ARTIST',
  Favorite = 'FAVORITE',
  Collection = 'COLLECTION',
}
