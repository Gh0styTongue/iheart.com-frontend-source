/* eslint-disable sort-keys */
const maxHeights = {
  '59': '(max-height: 59px)',
  '79': '(max-height: 79px)',
  '99': '(max-height: 99px)',
  '119': '(max-height: 119px)',
  '149': '(max-height: 149px)',
  '169': '(max-height: 169px)',
  '199': '(max-height: 199px)',
  '299': '(max-height: 299px)',
  '399': '(max-height: 399px)',
  '499': '(max-height: 499px)',
};

const maxWidths = {
  '119': '(max-width: 119px)',
  '149': '(max-width: 149px)',
  '199': '(max-width: 199px)',
  '225': '(max-width: 225px)',
  '239': '(max-width: 239px)',
  '269': '(max-width: 269px)',
  '299': '(max-width: 299px)',
  '320': '(max-width: 320px)',
  '370': '(max-width: 370px)',
  '400': '(max-width: 400px)',
  '420': '(max-width: 420px)',
  '599': '(max-width: 599px)',
  '640': '(max-width: 640px)',
  '768': '(max-width: 768px)',
  '899': '(max-width: 899px)',
  '980': '(max-width: 980px)',
  '990': '(max-width: 990px)',
  '1024': '(max-width: 1024px)',
  '1160': '(max-width: 1160px)',
  '1280': '(max-width: 1280px)',
  '1366': '(max-width: 1366px)',
};

const minHeights = {
  '80': '(min-height: 80px)',
  '301': '(min-height: 301px)',
  '400': '(min-height: 400px)',
};

const minWidths = {
  '260': '(min-width: 260px)',
  '300': '(min-width: 300px)',
  '375': '(min-width: 375px)',
  '399': '(min-width: 399px)',
  '420': '(min-width: 420px)',
  '599': '(min-width: 599px)',
  '768': '(min-width: 768px)',
  '990': '(min-width: 990px)',
  '1024': '(min-width: 1024px)',
  '1280': '(min-width: 1280px)',
  '1366': '(min-width: 1366px)',
};

interface MediaFeatures<H, W> {
  height: H;
  width: W;
}

type MediaQueries = Readonly<{
  max: MediaFeatures<
    Record<keyof typeof maxHeights, string>,
    Record<keyof typeof maxWidths, string>
  >;
  min: MediaFeatures<
    Record<keyof typeof minHeights, string>,
    Record<keyof typeof minWidths, string>
  >;
}>;

const mediaQueries: MediaQueries = {
  max: {
    height: maxHeights,
    width: maxWidths,
  },
  min: {
    height: minHeights,
    width: minWidths,
  },
};

export default mediaQueries;
