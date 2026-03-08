type OEmbedObject = {
  href: string;
  key: string;
  rel: 'alternate';
  title: string;
  type: 'application/json+oembed' | 'text/xml+oembed';
};

export default (
  baseUrl: string,
  fullUrl: string,
  title: string,
): [OEmbedObject, OEmbedObject] => [
  {
    key: 'application/json+oembed',
    href: `${baseUrl}/oembed?url=${encodeURIComponent(fullUrl)}&format=json`,
    rel: 'alternate',
    title,
    type: 'application/json+oembed',
  },
  {
    key: 'text/xml+oembed',
    href: `${baseUrl}/oembed?url=${encodeURIComponent(fullUrl)}&format=xml`,
    rel: 'alternate',
    title,
    type: 'text/xml+oembed',
  },
];
