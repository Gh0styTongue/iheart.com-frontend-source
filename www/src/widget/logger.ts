import Logger from 'modules/Logger/Logger';
import { consoleLogger } from 'modules/Logger/subscriptions';

export const CONTEXTS = {
  PLAYER: 'JWPLAYER',
  REACT: 'REACT',
  SERVER: 'SERVER',
  SERVICES: 'SERVICES',
  TRANSLATION: 'TRANSLATION',
};

const logger: Logger = Logger.create({
  namespace: ['WEB_WIDGET_V2'],
  subscriptions: [consoleLogger],
});

export default logger;
