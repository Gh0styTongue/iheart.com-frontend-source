import { mapValues } from 'lodash-es';

const replacementCharacter = '|';
const slashReg = /\//g;
const pipeReg = /\|/g;

type links = {
  [a: string]: string | undefined;
};

/*
  obfuscasteString takes a relative url and replaces forward slashes with a replacement character -
  generally a character that is invalid/unwise in a URI. https://tools.ietf.org/html/rfc3986
*/
export function obfuscateString(s: string | undefined): string | undefined {
  if (typeof s === 'string' && s.charAt(0) === '/') {
    return s.replace(slashReg, replacementCharacter);
  }

  return s;
}

export function obfuscate(m: links): links {
  return mapValues(m, obfuscateString);
}

/*
  debofuscateString takes a relative URI that has been processed to include the unwise/invalid of
  our choice and replace it with proper characters
*/
export function deobfuscateString(s: string | undefined): string | undefined {
  if (typeof s === 'string' && s.charAt(0) === replacementCharacter) {
    return s.replace(pipeReg, '/');
  }

  return s;
}

export function deobfuscate(m: links): links {
  return mapValues(m, deobfuscateString);
}
