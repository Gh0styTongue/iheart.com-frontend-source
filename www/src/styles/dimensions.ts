/* eslint-disable sort-keys */

export type Dimensions = Readonly<{
  [a: string]: string;
}>;

const dimensions: Dimensions = {
  bannerHeight: '5rem',
  headerHeight: '5.8rem',
  heroContentHeightTablet: '17.5rem',
  heroHeightTablet: '20rem',
  heroHeight: '28.5rem',
  heroPlayButton: '7.2rem',
  heroPlayButtonMobile: '5rem',
  gutter: '1.5rem',
  pageGutter: '3rem',
  pageWidthDesktop: '142rem',
  rightColumnWidth: '30rem',
  mainColumnWidth: 'calc(142rem - 30rem)', // pageWidthDesktop - rightColumnWidth
  miniPlayerHeight: '5rem',
  playerHeight: '8rem',
  tileOverlayTransitionTime: '150ms',
  pageSpacerMedium: '2rem',
};

export default dimensions;
