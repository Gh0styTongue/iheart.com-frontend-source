import safeStringify from 'safe-json-stringify';
import { removeHTMLScriptTags } from './string';

// circular references will cause JSON.stringify to throw, use safeStringify if error thrown
function fastAndSafeStringify(
  obj: any,
  replacer: Array<string> | null | ((key: any, value: any) => any) = null,
  space = 0,
): string {
  let s = '';

  try {
    s = JSON.stringify(obj, replacer as Array<string> | null, space);
  } catch {
    s = safeStringify(obj, replacer, space);
  }

  return typeof s === 'string' ? removeHTMLScriptTags(s) : s;
}

export default fastAndSafeStringify;
