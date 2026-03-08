import { slugify as slugifySingleString } from 'utils/string';

export function slugify(...toSlug: Array<string | number>): string {
  // slugifySingleString returns a maximum of 6 "-" separated "words".  We slugify each argument separately since
  // passing all of the arguments as a single space separated string may cut off the second or later arguments entirely.
  // These later arguments are almost always ids, which means they're just about the only part of the slug that we absolutely
  // should never cut off.
  return toSlug.map(slugifySingleString).join('-');
}

export function joinPathComponents(...pathComponents: Array<string>): string {
  return `/${pathComponents
    .flatMap(pathComponent => pathComponent.split('/'))
    .filter(Boolean)
    .join('/')}/`;
}
