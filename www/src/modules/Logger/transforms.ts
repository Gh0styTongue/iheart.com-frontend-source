import { Log } from './types';

export function createTitle(delimiter = '|') {
  return function titleize(log: Log): Log {
    let arr = [log.type, ...log.context];

    if (typeof log.data === 'string') {
      arr = [...arr, log.data];
    }
    return {
      ...log,
      meta: {
        ...log.meta,
        title: arr.join(delimiter),
      },
    };
  };
}
