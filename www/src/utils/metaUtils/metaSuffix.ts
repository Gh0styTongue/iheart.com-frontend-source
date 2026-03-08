// Moved this inline conditional mess into this helper function for
// fixing the ending of meta descriptions

export default function metaSuffix(metaString = ''): string {
  if (!metaString || metaString.length < 1) {
    return metaString;
  }
  return metaString.slice(-1) === '.' ? `${metaString} ` : `${metaString}. `;
}
