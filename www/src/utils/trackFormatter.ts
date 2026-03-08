export const concatTitleAndVersion = (title = '', version = ''): string =>
  version ? `${title} [${version}]` : title;
