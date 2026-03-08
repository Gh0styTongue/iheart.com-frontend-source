import { format, parse } from 'url';

export default function metaResolveUrl(
  siteUrl: string,
  pagePath: string | null,
): string {
  // within our meta components, the pagePath selector is sometimes briefly null.  This triggers an error on the resolve call.
  if (!pagePath) return siteUrl;

  const parsed = parse(pagePath);
  const parsedSiteUrl = parse(siteUrl);
  return format({
    ...parsed,
    host: parsedSiteUrl.host,
    protocol: parsedSiteUrl.protocol || parsed.protocol,
  });
}
