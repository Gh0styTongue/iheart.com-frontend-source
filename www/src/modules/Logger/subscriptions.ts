import { createConsoleLogger } from './helpers';
import { Filter, Log } from './types';

export const consoleLogger = {
  onError: createConsoleLogger({ color: '#EC644B' }),
  onInfo: createConsoleLogger({ color: '#87D37C' }),
  onWarn: createConsoleLogger({ color: '#F7CA18' }),
  shouldLog({ context, type }: Log, enabled: boolean, filter: Filter): boolean {
    if (!enabled) return false;
    if (typeof filter === 'string')
      return context.includes(filter) || type.includes(filter);
    if (filter instanceof RegExp)
      return filter.test(context.join('|')) || filter.test(type);
    return true;
  },
};
