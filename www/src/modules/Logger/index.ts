import Logger from './Logger';
import { consoleLogger } from './subscriptions';
import { createTitle } from './transforms';

export { CONTEXTS, STATION_TYPE_CONTEXT_MAP } from './constants';

const logger: Logger = Logger.create({
  namespace: ['WEB_APP'],
  subscriptions: [consoleLogger],
  transforms: [createTitle('|')],
});

export default logger;
