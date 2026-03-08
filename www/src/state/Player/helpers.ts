export function matchProtocol(url: string, protocol: string | null = null) {
  let transform: string | null;
  if (!protocol) {
    transform = __CLIENT__ ? window.location.protocol.replace(':', '') : null;
  } else {
    transform = protocol;
  }

  if (transform) {
    return transform.startsWith('https') ?
        url.replace(/^http:\/\//i, 'https://')
      : url.replace(/^https:\/\//i, 'http://');
  }

  return url;
}
