import qs from 'qs';

export const slugIdRegEx = /([\d\-\w]*-(\d+))|(\d+)/; // Matches any string OR string-number

export function getIdFromSlug(slug = '') {
  const parsed = slug.match(slugIdRegEx);
  const splitId = slug.split('-');

  return parsed && splitId ? parseInt(splitId.pop()!, 10) : null;
}

export function isValidSlug(slug = '') {
  // check if we have a valid slug REGARDLESS OF WHETHER IT ENDS WITH AN ID
  if (slug.includes('null')) return false;
  return !!slug.split('-').filter(Boolean).length;
}

export function createWidgetQuery(source: string): string {
  return qs.stringify({
    embed: true,
    ref: source,
  });
}
