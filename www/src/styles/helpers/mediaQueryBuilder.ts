/** @function mediaQueryBuilder
 * Takes arugments and combines them into one media query string
 * @param {...args} args - as string or array of strings
 * @example
 * mediaQueryBuilder('(max-width: 10px)', '(min-height: 10px)')
 *   = @media
 *      only screen and (max-width: 10px),
 *      only screen and (min-height: 10px)
 * @example
 * mediaQueryBuilder('(max-width: 10px)', ['(min-height: 20px)', '(max-height: 200px)'])
 *   = @media
 *      only screen and (max-width: 10px),
 *      only screen and (min-height: 20px) and (max-height: 200px)
 */

function mediaQueryBuilder(...args: Array<string | Array<string>>): string {
  return Array.from(args).reduce<string>((retQuery, query, index) => {
    let transformedQuery = '';
    const comma = index < args.length - 1 ? ',' : '';

    if (Array.isArray(query)) {
      transformedQuery = query.reduce(
        (combinedQuery, indivQuery) => `${combinedQuery} and ${indivQuery}`,
        'only screen',
      );
    } else if (typeof query === 'string') {
      transformedQuery = `only screen and ${query}`;
    }
    return `${retQuery} ${transformedQuery}${comma}`;
  }, '@media');
}

export default mediaQueryBuilder;
