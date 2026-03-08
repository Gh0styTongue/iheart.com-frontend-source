import { IGetTranslateFunctionResponse } from 'redux-i18n';

export function getTranslatedKeyword(
  translate: IGetTranslateFunctionResponse,
  keyword = '',
) {
  const dictionary = {
    'all access': translate('all access'),
    'best playlists': translate('Best Playlists'),
    'concert pictures': translate('concert pictures'),
    'create playlists': translate('create playlists'),
    'custom radio station': translate('custom radio station'),
    'event pictures': translate('event pictures'),
    'favorite music': translate('favorite music'),
    'favorite songs': translate('favorite songs'),
    'music playlists': translate('Music Playlists'),
    'my music': translate('my music'),
    'now playing': translate('Now Playing'),
    'on demand': translate('On Demand'),
    'online playlists': translate('Online Playlists'),
    'paid music': translate('paid music'),
    'paid songs': translate('paid songs'),
    'personal radio station': translate('personal radio station'),
    'personalized radio station': translate('personalized radio station'),
    'play songs': translate('play songs'),
    'pop playlists': translate('Top Playlists'),
    'recent photos': translate('recent photos'),
    'recent pictures': translate('recent pictures'),
    'saved music': translate('saved music'),
    'saved songs': translate('saved songs'),
    'top playlists': translate('top playlists'),
    albums: translate('Albums'),
    app: translate('App'),
    artist: translate('Artist'),
    artists: translate('Artists'),
    bands: translate('Bands'),
    best: translate('Best'),
    discover: translate('Discover'),
    download: translate('Download'),
    free: translate('Free'),
    iheart: translate('iHeart'),
    iheartradio: translate('iHeart'),
    influencers: translate('Influencers'),
    influences: translate('Influences'),
    internet: translate('Internet'),
    listen: translate('Listen'),
    live: translate('Live'),
    lyrics: translate('Lyrics'),
    music: translate('Music'),
    online: translate('Online'),
    personalized: translate('Personalized'),
    photos: translate('photos'),
    pictures: translate('pictures'),
    playlist: translate('Playlist'),
    popular: translate('Popular'),
    radio: translate('Radio'),
    related: translate('Related'),
    similar: translate('Similar'),
    song: translate('Song'),
    songs: translate('Songs'),
    station: translate('Station'),
    stations: translate('Stations'),
    stream: translate('stream'),
    streaming: translate('Streaming'),
    talk: translate('Talk'),
    top: translate('Top'),
  };

  return (
    dictionary[keyword.toLocaleLowerCase() as keyof typeof dictionary] ||
    keyword
  );
}

export function translateKeywords(
  translate: IGetTranslateFunctionResponse,
  keywords: string,
) {
  return keywords
    .split(',')
    .map(word => getTranslatedKeyword(translate, word.trim()))
    .join(', ');
}
