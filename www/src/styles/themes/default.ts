import clearfix from 'styles/mixins/clearfix';
import darkColors from 'styles/darkColors';
import dimensions from 'styles/dimensions';
import ellipsis from 'styles/mixins/ellipsis';
import fonts from 'styles/fonts';
import keyframes from 'styles/keyframes';
import lightColors from 'styles/colors';
import mediaQueries from 'styles/mediaQueries';
import ulReset from 'styles/mixins/ulReset';
import zIndex from 'styles/zIndex';

type Base = Readonly<{
  dimensions: typeof dimensions;
  fonts: typeof fonts;
  keyframes: typeof keyframes;
  mediaQueries: typeof mediaQueries;
  mixins: {
    [a: string]: any;
  };
  zIndex: typeof zIndex;
}>;

export type Theme = Base & {
  colors: typeof lightColors;
};

const base: Base = {
  dimensions,
  fonts,
  keyframes,
  mediaQueries,
  mixins: {
    clearfix,
    ellipsis,
    ulReset,
  },
  zIndex,
};

export const lightTheme: Theme = {
  ...base,
  colors: lightColors,
};

export const darkTheme: Theme = {
  ...base,
  colors: darkColors,
};

export default lightTheme;
