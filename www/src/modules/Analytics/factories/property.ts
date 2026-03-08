/* eslint-disable func-names */

import logger, { CONTEXTS } from 'modules/Logger';

function property(key: string, value: any, required = false) {
  return function (context: string): {
    [a: string]: number | string;
  } {
    if (value === undefined || value === null) {
      if (required) {
        logger.warn(
          [CONTEXTS.ANALYTICS, context],
          `${key} is a required valued.`,
        );
      }
      return {};
    }
    return { [key]: value };
  };
}

export default property;
