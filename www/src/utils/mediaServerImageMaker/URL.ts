import UrlParse from 'url-parse';

export default function defaultUrlParse(url: string) {
  return new UrlParse(url, {}, true);
}
