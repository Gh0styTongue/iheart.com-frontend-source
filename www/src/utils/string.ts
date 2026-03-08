// # String Utilities
// All string manipulation functions are here
/**
 * @module utils/string
 */

/**
 * From underscore.string, escape reg ex char in a string
 * @param  {String} str String to be processed
 * @return {String}     String after regex is escaped
 */
function _escapeRegExp(str: string): string {
  if (!str) return '';
  return String(str).replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1');
}

function defaultToWhiteSpace(characters: null | RegExp | string): string {
  if (characters === null) return '\\s';
  if ((characters as RegExp).source) return (characters as RegExp).source;
  return `[${_escapeRegExp(characters as string)}]`;
}

/**
 * From underscore.string, convert camelcase to dash
 * @param  {String} str String to be processed
 * @return {String}     Dasherized string
 */
export function dasherize(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .replace(/([A-Z])/g, '-$1')
    .replace(/[-_\s]+/g, '-')
    .toLowerCase();
}

/**
 * Remove all html tags from a string.
 * This is relatively dumb, just removes the tags. If there is important text in tag attributes, it will be lost
 * @param {String} str string containing html tags
 * @returns {String}   string without html tags
 */
export const removeHTML = (str: string) => str.replace(/(<([^>]+)>)/gi, ' ');

/**
 * Remove all script tags from a string.
 * @param {String} str string containing <script /> tags
 * @returns {String}   string without <script /> tags
 */
export const removeHTMLScriptTags = (str: string) =>
  str.replace(/<\/script/g, '<\\/script').replace(/<!--/g, '<&#033;--');

/**
 * From underscore.string, slugify a string.
 * @example
 * slugify('iHeart is up'); // 'iheart-is-up'
 * @param  {String | Number} str String to be processed
 * @return {String}     Slugified string
 */
export function slugify(str: string | number): string {
  if (!str) return '';

  const from = 'ąàáäâãåæćęèéëêìíïîłńòóöôõøùúüûñçżź';
  const to = 'aaaaaaaaceeeeeiiiilnoooooouuuunczz';
  const regex = new RegExp(defaultToWhiteSpace(from), 'g');
  const maxSlugWordCount = 6;

  const path = String(str)
    .toLowerCase()
    .replace(regex, c => {
      const index = from.indexOf(c);
      return to.charAt(index) || '-';
    })
    .replace(/[^\w\s-]/g, '') // Removes any non-word characters or white spaces.
    .split(' ')
    .slice(0, maxSlugWordCount)
    .join(' ');

  return dasherize(path);
}

/**
 * Truncate the string to a length, with ...
 * @param  {String} str         String to truncate
 * @param  {Numer} length       Length of result string
 * @param  {String} truncateStr String to append (default to ...)
 * @return {String}             Truncated string
 */
export function truncate(
  s: string,
  len: string | number,
  truncateStr = '...',
): string {
  const str = String(s);
  const length = parseInt(len as string, 10);
  return str.length > length ? str.slice(0, length) + truncateStr : str;
}

/**
 * Truncate only the text of an html string to max lengtgh, leaving all tags intact
 */
export function truncateHtml(
  htmlStr: string,
  maxLen: number,
  truncateStr = '...',
): {
  textLen: number;
  truncatedText: string;
} {
  // IHRACP-2353: whitelisted html tags for pocast episode descriptions:
  // a, (b,) br, (em,) i, li, p, strong
  const tagInners = [
    ['a [^>]*', '/a'],
    ['b', '/b'],
    ['br(?:\\s+/)'],
    ['em', '/em'],
    ['i', '/i'],
    ['li', '/li'],
    ['p', '/p'],
    ['strong', '/strong'],
  ];
  const htmlRegex = new RegExp(
    `(?:${tagInners
      .flat()
      .map(t => `<\\s*${t}\\s*>`)
      .join('|')})`,
    `gi`,
  );
  // split string into text array and html tags array
  // order of orig string is maintained with split & match methods
  // even if orig string starts with tag, 1st element of text array will be empty string
  // so, can be reassembled as [textArr[0], tagsArr[0], textArr[n], tagsArr[n]]
  let textArr = htmlStr.split(htmlRegex) || [];
  const tagsArr = htmlStr.match(htmlRegex) || [];
  let workingLen = 0; // keep track of length of text over multiple array text elements
  let idx = 0; // which array element

  while (workingLen <= maxLen && idx < textArr.length) {
    // truncate() will truncate text of current element if it
    // exceeds max length minus the length of preceding elements
    // otherwise it will return string as is
    textArr[idx] = truncate(textArr[idx], maxLen - workingLen, truncateStr);
    workingLen += textArr[idx].length;
    idx += 1;
  }
  // remove all text elements after truncated text element
  textArr = textArr.slice(0, idx);
  let reassembled = '';
  const exitIdx = Math.max(tagsArr.length, textArr.length);
  let strPosOfTruncatedText = -1;
  for (let i = 0; i < exitIdx; i += 1) {
    // text array will always have the first element of final string
    // so push text array element to final array first
    if (textArr[i]) reassembled += textArr[i];
    if (tagsArr[i]) reassembled += tagsArr[i];
    if (i === idx - 1) {
      strPosOfTruncatedText = reassembled.length;
    }
  }
  if (strPosOfTruncatedText) {
    let filteredTruncatedHtml = reassembled.slice(strPosOfTruncatedText);
    const filteredRegex = new RegExp(
      `(?:${tagInners
        .map(
          ([opening, closing = null]) =>
            `<${opening}>${closing ? `\\s*<${closing}>` : ``}`,
        )
        .join('|')})`,
      'i',
    );

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const filteredString = filteredTruncatedHtml.replace(filteredRegex, '');
      if (filteredString === filteredTruncatedHtml) {
        break;
      }
      filteredTruncatedHtml = filteredString;
    }
    reassembled =
      reassembled.slice(0, strPosOfTruncatedText) + filteredTruncatedHtml;
  }
  return {
    textLen: workingLen,
    truncatedText: reassembled,
  };
}
