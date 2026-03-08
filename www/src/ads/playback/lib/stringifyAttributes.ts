/**
 * Stringifies values on an object. null and undefined become 'null'
 * @param  {Object} attrs attribute object
 * @return {Object}       clone of attrs except all values are string or 'null'
 */
function stringifyAttributes<
  T extends Record<string, string | number | null | undefined | boolean>,
>(attrs: T) {
  const result: Record<string, string> = {};

  Object.keys(attrs).forEach(k => {
    const attr = attrs[k];

    if (!attr) {
      if (attr === null || attr === undefined) {
        result[k] = 'null';
        return;
      }
    }

    result[k] = attr?.toString();
  });

  return result;
}

export default stringifyAttributes;
