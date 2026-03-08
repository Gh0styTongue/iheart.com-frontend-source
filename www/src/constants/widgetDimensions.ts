export type WidgetDimensions = {
  fixedWidth: number;
  height: string | number;
  width: string | number;
};

type WidgetTypes =
  | 'ARTIST'
  | 'DEFAULT'
  | 'FAVORITES'
  | 'LIVE'
  | 'PLAYLIST'
  | 'PODCAST_EPISODE'
  | 'PODCAST_PROFILE';

export const WIDGET_DIMENSIONS: {
  [key in WidgetTypes]: WidgetDimensions;
} = {
  ARTIST: {
    fixedWidth: 450,
    height: 300,
    width: '100%',
  },
  DEFAULT: {
    fixedWidth: 450,
    height: 300,
    width: '100%',
  },
  FAVORITES: {
    fixedWidth: 450,
    height: 300,
    width: '100%',
  },
  LIVE: {
    fixedWidth: 450,
    height: 200,
    width: '100%',
  },
  PLAYLIST: {
    fixedWidth: 450,
    height: 300,
    width: '100%',
  },
  PODCAST_EPISODE: {
    fixedWidth: 450,
    height: 200,
    width: '100%',
  },
  PODCAST_PROFILE: {
    fixedWidth: 450,
    height: 300,
    width: '100%',
  },
};
