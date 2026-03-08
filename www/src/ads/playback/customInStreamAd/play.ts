import type { CustomInStreamAdMethods } from './types';

const play: CustomInStreamAdMethods['play'] = () => async () => {
  // TODO - tell redux we are playing, this will be used when we need to reflect this in UI
};

export default play;
