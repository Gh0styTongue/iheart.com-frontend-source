// extracts id from web and device URLs, looking at both to ensure consistency.
export function parseId(web: string, device: string) {
  const webVal = web.split('-').slice(-1)[0].replace(/\//g, '');
  const deviceVal = device.split('/').slice(-1)[0];
  if (webVal !== deviceVal || Number.isNaN(Number(webVal))) {
    if (!Number.isNaN(Number(webVal))) {
      return Number(webVal);
    }
    if (!Number.isNaN(Number(deviceVal))) {
      return Number(deviceVal);
    }
    return undefined;
  }
  return Number(webVal);
}

// input should look like https://www.iheart.com/show/7-Up-First-28457197/?autoplay=true
export function parseSlugFromUrl(webUrl: string) {
  return webUrl // https://www.iheart.com/show/7-Up-First-28457197/?autoplay=true
    .split('/') // ['https:','www.iheart.com','show','7-Up-First-28457197','?autoplay=true']
    .slice(-2)[0] // '7-Up-First-28457197'
    .split('-') // ['7','Up','First','28457197']
    .slice(0, -1) // ['7','Up','First']
    .join('-'); // '7-Up-First'
}
