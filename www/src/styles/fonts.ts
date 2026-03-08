type Key = 'tiny' | 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';

export type FontKey = { [a in Key | string]: string };

export type Fonts = {
  lineHeight: FontKey;
  size: FontKey;
  weight: {
    bold: number;
    medium: number;
    regular: number;
  };
};

const fonts: Readonly<Fonts> = {
  size: {
    '12': '1.2rem',
    '13': '1.3rem',
    '14': '1.4rem',
    '16': '1.6rem',
    '18': '1.8rem',
    '20': '2.0rem',
    '22': '2.2rem',
    '24': '2.4rem',
    '32': '3.2rem',
    '40': '4rem',
    tiny: '1rem',
    xsmall: '1.3rem',
    small: '1.6rem',
    medium: '2.2rem',
    large: '3.6rem',
    xlarge: '4.8rem',
  },
  lineHeight: {
    '14': '1.4rem',
    '16': '1.6rem',
    '18': '1.8rem',
    '20': '2rem',
    '21': '2.1rem',
    '22': '2.2rem',
    '24': '2.4rem',
    '26': '2.6rem',
    '30': '3rem',
    '36': '3.6rem',
    '38': '3.8rem',
    '46': '4.6rem',
    xsmall: '1.8rem',
    small: '2rem',
  },
  weight: {
    regular: 400,
    medium: 500,
    bold: 700,
  },
};

export default fonts;
