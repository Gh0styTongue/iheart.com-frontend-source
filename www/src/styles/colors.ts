type Numbers = '100' | '200' | '300' | '400' | '500' | '600';

type ColorMap<Keys extends string> = { [Key in Keys]: string };

export type Colors = Readonly<{
  black: ColorMap<'dark' | 'primary' | 'secondary'>;
  blue: ColorMap<Numbers | 'primary' | 'secondary'>;
  blueNew: ColorMap<'500' | '600'>;
  gradients: ColorMap<
    | 'blueSky'
    | 'keyLime'
    | 'sunrise'
    | 'sunset'
    | 'emptyPlaylist'
    | 'myPlaylistWelcomeBanner'
  >;
  gray: ColorMap<
    | Numbers
    | '150'
    | '450'
    | '550'
    | 'dark'
    | 'light'
    | 'medium'
    | 'primary'
    | 'secondary'
    | 'tertiary'
  >;
  green: ColorMap<Numbers>;
  orange: ColorMap<Numbers | 'primary'>;
  purple: ColorMap<Numbers | 'primary'>;
  red: ColorMap<Numbers | 'primary' | 'secondary' | 'tertiary' | 'default'>;
  social: ColorMap<
    | 'apple'
    | 'facebook'
    | 'googlePlay'
    | 'googlePlus'
    | 'instagram'
    | 'pinterest'
    | 'snapchat'
    | 'tumblr'
    | 'x'
    | 'youtube'
  >;
  transparent: ColorMap<'dark' | 'light' | 'medium' | 'primary' | 'secondary'>;
  white: ColorMap<'primary'>;
}>;

const colors: Colors = {
  black: {
    dark: '#000000',
    primary: '#181818',
    secondary: '#2F3133',
  },
  blue: {
    '100': '#A3E2EB',
    '200': '#84DAE5',
    '300': '#68C8D5',
    '400': '#60BAC6',
    '500': '#509DA7',
    '600': '#267883',
    primary: '#43A7FB',
    secondary: '#3179CD',
  },
  blueNew: {
    '500': '#288BD3',
    '600': '#0055B7',
  },
  gradients: {
    blueSky: 'linear-gradient(153.87deg, #8B6AE9 0%, #84DAE5 100%)',
    keyLime: 'linear-gradient(153.68deg, #8BDEA7 0%, #60BAC6 100%)',
    sunrise: 'linear-gradient(153.87deg, #F7CA94 0%, #E22C3A 100%)',
    sunset: 'linear-gradient(153.87deg, #8B6AE9 0%, #F4747C 100%)',
    emptyPlaylist: 'linear-gradient(153.87deg, #27292D 0%, #55565B 100%)',
    myPlaylistWelcomeBanner:
      'linear-gradient(147.65deg, #0055B7 9.1%, #2880D3 99.36%)',
  },
  gray: {
    '100': '#F6F8F9',
    '150': '#EDF1F3',
    '200': '#E6EAED',
    '300': '#C5CDD2',
    '400': '#717277',
    '450': '#55565b',
    '500': '#3F4447',
    '550': '#2D3134',
    '600': '#27292D',
    dark: '#333333',
    light: '#D7D7D7',
    medium: '#717277',
    primary: '#D7DCE0',
    secondary: '#EFEFEF',
    tertiary: '#ACB6BF',
  },
  green: {
    '100': '#ACE7C0',
    '200': '#9CE2B4',
    '300': '#8BDEA7',
    '400': '#78D297',
    '500': '#62AA7B',
    '600': '#46815A',
  },
  orange: {
    '100': '#F5D2A9',
    '200': '#F7CA94',
    '300': '#F2C086',
    '400': '#EDB574',
    '500': '#DA994D',
    '600': '#CC8838',
    primary: '#F98524',
  },
  purple: {
    '100': '#BBA6F8',
    '200': '#A488F3',
    '300': '#8B6AE9',
    '400': '#7D5AE0',
    '500': '#6B44DA',
    '600': '#5B34CC',
    primary: '#7A16D2',
  },
  red: {
    '100': '#F4ADB1',
    '200': '#F79096',
    '300': '#F4747C',
    '400': '#EF4550',
    '500': '#D52D37',
    '600': '#C6002B',
    primary: '#C6002B',
    secondary: '#E22C3A',
    tertiary: '#CC032E',
    default: '#D2252A',
  },
  social: {
    apple: '#333333',
    facebook: '#3B5998',
    googlePlay: '#97AB2E',
    googlePlus: '#C63D2D',
    instagram: '#517FA4',
    pinterest: '#BD081C',
    snapchat: '#FFFC00',
    tumblr: '#32506D',
    youtube: '#E52D27',
    x: '#000000',
  },
  transparent: {
    dark: 'rgba(0, 0, 0, 0.5)',
    light: 'rgba(255, 255, 255, 0.5)',
    medium: 'rgba(119, 119, 119, 0.7)',
    primary: 'transparent',
    secondary: 'rgba(23, 23, 23, 0.2)',
  },
  white: {
    primary: '#FFFFFF',
  },
};

export default colors;
