import getScript from 'utils/getScript';

type Options = {
  globalVar: keyof Window;
  scopedName: string;
  queueKey: null | string;
};

/**
 * Build instance that can load a script and enqueue functions, not necessarily in that order.
 */
const scriptQueue = ({ globalVar, scopedName, queueKey }: Options) => {
  /**
   * Contains the script's global as a property of this scope object.
   */
  type Instance = (typeof window)[typeof globalVar];
  type ScopeArg = { [k in typeof scopedName]: Instance };
  type EnqueuedFunction = { (scope: ScopeArg): void };

  if (!__CLIENT__) {
    // TODO: Can we just make sure we never call this for SSR?
    return {
      load: () => Promise.resolve(),
      enqueue: () => Promise.resolve(),
    };
  }

  // Make sure the script hasn't been loaded elsewhere.
  // TODO: Re-enable this when we aren't already grabbing GPT elsewhere.
  // if (typeof window[globalVar] !== 'undefined') {
  //   throw new Error(`Global "${globalVar}" already present in DOM.`);
  // }

  // Keep track of whether or not we have initialized.
  let isInitialized = false;
  let isLoadedCalled = false;

  // Attach a default queue to window
  if (queueKey) {
    Object.assign(window, { [globalVar]: { [queueKey]: [] } });
  }

  // Get our global reference.
  const getInstance = () => window[globalVar] as Instance;

  // Once the first queued command has been executed, we are ready.
  const isReadyPromise =
    queueKey ?
      new Promise<void>(resolve => {
        getInstance()[queueKey].push(() => resolve());
      })
    : Promise.resolve();

  // Execute every function with the right scope argument.
  const execute = (fn: EnqueuedFunction) =>
    Promise.resolve(fn({ [scopedName]: getInstance() } as ScopeArg));

  // Keep a queue of commands to run before the script is done initializing.
  const preInitializedQueue: Array<{ (): void }> = [];

  return {
    /**
     * Load the script and, optionally, initialize it.
     */
    load: async (scriptUrl: string, initializeFn?: EnqueuedFunction) => {
      // Make sure we haven't already tried to load this script.
      if (isLoadedCalled) {
        throw new Error(`Script "${globalVar}" already loaded.`);
      }
      isLoadedCalled = true;

      // Wait until we are ready.
      await Promise.all([getScript(scriptUrl, null), isReadyPromise]);

      // Run the initialization function and then run the queue.
      return (initializeFn ? execute(initializeFn) : Promise.resolve()).then(
        result => {
          isInitialized = true;

          // Run our queue.
          preInitializedQueue.forEach(fn => fn());
          preInitializedQueue.slice(0, Infinity);

          // Case our return as a promise.
          return Promise.resolve(result);
        },
      );
    },

    get isLoadedCalled() {
      return isLoadedCalled;
    },

    /**
     * Attach a function. If initialized it will be queued, otherwise it will be run right away.
     */
    enqueue: (fn: EnqueuedFunction) => {
      if (!isInitialized) {
        // Enqueue the function.
        return new Promise((resolve, reject) => {
          preInitializedQueue.push(() => {
            execute(fn).then(resolve).catch(reject);
          });
        });
      } else {
        // Run the function immediately.
        return Promise.resolve(execute(fn));
      }
    },
  };
};

export default scriptQueue;
