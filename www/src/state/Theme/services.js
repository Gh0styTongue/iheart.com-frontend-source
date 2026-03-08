const themeUrls = {};

export const THEMES = {
  HERO: 'HERO',
};

export const configure = urls => {
  if (urls) {
    themeUrls[THEMES.HERO] = urls.heroTheme;
  }
};

export const themeApi = theme => themeUrls[theme];

if (__CLIENT__) {
  configure(window.BOOT);
}
