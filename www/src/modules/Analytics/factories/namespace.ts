/* eslint-disable func-names */

import composeEventData from './composeEventData';

type ObjectMap = {
  [a: string]: any;
};

type Args = Array<((a: string) => ObjectMap) | ObjectMap>;

function namespace(key: string, predicate = true) {
  return function (...args: Args) {
    return function (context: string): ObjectMap {
      const filtered = args.reduce((acc: Array<any>, curr) => {
        const result = typeof curr === 'function' ? curr(context) : curr;
        return [...acc, ...(Object.keys(result).length ? [result] : [])];
      }, []);
      return predicate && filtered.length ?
          { [key]: composeEventData(context)(...filtered) }
        : {};
    };
  };
}

export default namespace;
