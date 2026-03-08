/* eslint-disable func-names */

type ObjectMap = {
  [a: string]: any;
};

type Args = Array<((a: string) => ObjectMap) | ObjectMap>;

function composeEventData(context: string) {
  return function (...args: Args): ObjectMap {
    return args.reduce(
      (acc, curr) => ({
        ...acc,
        ...(typeof curr === 'function' ? curr(context) : curr),
      }),
      {},
    );
  };
}

export default composeEventData;
