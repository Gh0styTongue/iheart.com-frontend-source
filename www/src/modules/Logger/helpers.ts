/* eslint-disable no-console */

import darken from 'styles/helpers/colors/darken';
import { Log } from './types';

function styles(color: string): string {
  return `
    background-color: ${color};
    border-radius: 2px;
    border: 1px solid ${darken(color, 0.15)};
    color: #FFFFFF;
    padding: 3px 6px;
  `;
}

function formatTitle(title: string): string {
  const [type, ...rest] = title.split('|');
  return `%c${type}%c ${rest.join(' ➡️ ')}`;
}

export function createConsoleLogger({ color }: { color: string }) {
  return function logger(log: Log): void {
    if (!__CLIENT__) {
      // keep any server-related logging libs out of the client
      const {
        default: serverLogger,
        // eslint-disable-next-line global-require
      } = require('modules/Logger/serverConsoleLogger');

      serverLogger(color, log);
      return;
    }

    const title = log.meta && log.meta.title ? log.meta.title : '';
    console.groupCollapsed(formatTitle(title), styles(color), '');
    console.groupCollapsed('Data');
    console.log(log.data);
    console.groupEnd();
    console.groupCollapsed('Raw Log');
    console.log(log);
    console.groupEnd();
    console.groupCollapsed('Stack Trace');
    console.trace(log.trace);
    console.groupEnd();
    console.groupEnd();
  };
}
