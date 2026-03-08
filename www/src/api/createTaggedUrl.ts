import safeStringify from 'utils/safeStringify';

type Param = {
  [a: string]: string | number;
};

type Params = Array<Param>;
type UrlString = string;
type ParameterizedUrlString = string;
type ReturnTuple = [UrlString, ParameterizedUrlString];

/**
 * createTaggedUrl uses ES tagged template literals to produce the needed URL for service calls
 * in addition to a parameterized URL string for use in various monitors
 *
 * called thus: createTaggedUrl`/hello/{ world: 'there' }/wow`
 *
 * this function will produce a tuple:
 * ['/hello/there/wow', '/hello/{world}/wow']
 *
 */
export default function createTaggedUrl(
  paths: TemplateStringsArray,
  ...params: Params
): ReturnTuple {
  let url = '';
  let tagged = '';

  for (let i = 0; i < params.length; i += 1) {
    const targetParam: Param = params[i];

    if (
      !targetParam ||
      typeof targetParam !== 'object' ||
      Array.isArray(targetParam)
    ) {
      throw new Error(
        `params must be object, received: ${safeStringify(targetParam)}`,
      );
    }

    const keys = Object.keys(targetParam);

    if (keys.length !== 1) {
      throw new Error(
        `params must have one key only, received: ${safeStringify(
          targetParam,
        )}`,
      );
    }

    const key = keys[0];
    const val = targetParam[key];

    if (
      val === undefined ||
      val === null ||
      !(typeof val === 'string' || typeof val === 'number')
    ) {
      throw new Error(
        `params must have a useable value, received: ${key}: ${safeStringify(
          val,
        )}`,
      );
    }

    url += paths[i] + String(val);
    tagged += `${paths[i]}{${key}}`;
  }

  // there may be an extra path string to append after the last param, if it exists append it here
  const lastPath = paths[params.length];
  if (lastPath) {
    url += lastPath;
    tagged += lastPath;
  }

  return [url, tagged];
}
