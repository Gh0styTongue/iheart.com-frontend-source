type FlatObject = Record<string, string | number | null | undefined | boolean>;
/**
 * AMP provides a url with a query string which has key value pairs like the following:
 * some_property: {AMP_SOME_PROPERTY}
 * This function replaces those tag values with a corresponding value from a replacer object
 *
 * ```ts
 * const queryObj = { some_property: '{AMP_SOME_PROPERTY}' };
 * const replacer = { AMP_SOME_PROPERTY: 'hello world!' };
 * const replaced = replaceAmpTags(queryObj, replacer); // { some_property: 'hello world!' };
 * ```
 */
function replaceAmpTags(
  queryObj: FlatObject,
  replacer: FlatObject,
): FlatObject {
  const replaced = { ...queryObj };

  Object.entries(replaced).forEach(([key, value]) => {
    if (typeof value === 'string' && value.startsWith('{AMP')) {
      // Grab the substring without braces
      const tag = value.slice(1, -1);
      // Update the value from the corresponding property on the replacer obj
      replaced[key] = replacer[tag as string];
    }
  });

  return replaced;
}

export default replaceAmpTags;
