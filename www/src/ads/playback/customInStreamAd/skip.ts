import type { CustomInStreamAdMethods } from './types';

/**
 * A custom in-stream ad will be skipped if one is currently playing and a user
 * loads a new station. This method just resets the custom in-stream flow
 */
const skip: CustomInStreamAdMethods['skip'] = () => async () => {};

export default skip;
