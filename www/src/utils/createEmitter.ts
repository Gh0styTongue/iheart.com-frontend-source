import { isFunction, isUndefined } from 'lodash-es';
import { v4 as uuid } from 'uuid';
import type { AsyncReturnType, ConditionalPick } from 'type-fest';

// import { isAsyncFunction, isFunction, isUndefined } from '../typeof/index.js';
export type Fn = (...args: any) => any;

export type Config = Record<string, any> & { initialize?: Fn };

export type Subscription<
  C extends ConditionalPick<Config, Fn>,
  Key extends keyof C = keyof C,
> = Readonly<
  {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    [Key in keyof C]?: (
      payload: AsyncReturnType<C[Key]>,
      ...args: Parameters<C[Key]>
    ) => unknown;
  } & {
    all?<K extends Key>(key: K, payload: AsyncReturnType<C[K]>): unknown;
    all?<K extends Key>(
      key: K,
      payload: AsyncReturnType<C[K]>,
      ...args: Parameters<C[K]>
    ): unknown;

    catch?<K extends Key>(key: K, payload: Error): unknown;
    catch?<K extends Key>(
      key: K,
      payload: Error,
      ...args: Parameters<C[K]>
    ): unknown;
  }
>;

export type Subscriptions<T extends Config> = Record<symbol, Subscription<T>>;

export type Emitter<T extends Config> = T & {
  __SUBSCRIPTIONS__: Subscriptions<T>;
  get enabled(): boolean;
  get flushing(): boolean;
  get initialized(): boolean;
  disable(): void;
  enable(): void;
  subscribe(subscription: Subscription<T>): () => void;
};

// eslint-disable-next-line no-empty-function, func-names
const AsyncFunction = async function () {}.constructor;

function isAsyncFunction(value: unknown) {
  return value instanceof AsyncFunction;
}

/**
 * @remarks {@link createEmitter} provides a super flexible api for creating an asynchronous event
 * emitter. All events that are emitted through this api are fired off in the order in which they
 * are called while exposing each method as an aynchronous function.
 *
 * @param {Object} config - An object of functions. Also, optionally takes a special `initialize()`
 * function that will execute once before the first interaction with the emitter has resolved.
 *
 * @returns An object with the same functions you passed into the config object with the addition
 * of `subscribe()` and `initialized()` methods. The only difference is that all the methods you
 * passed into the config object are now asynchronous.
 *
 * @example
 *
 * const logger = createEmitter({
 *   error: message => ({
 *     level: 'error',
 *     message,
 *     timestamp: Date.now()
 *   }),
 * });
 *
 * logger.subscribe({
 *   error: ({ level, ...log }) => console[log.level](log),
 * });
 *
 * logger.error(':(');
 */

export function createEmitter<T extends Config>(config: T): Emitter<T> {
  const INITIALIZE_KEY = 'initialize';
  const InitializeError = new Error(
    `${INITIALIZE_KEY}() can only be called once.`,
  );

  const queue: Array<() => Promise<void>> = [];

  const subscriptions: Subscriptions<T> = {};
  // const subscriptions: Subscriptions<T> = new WeakMap<symbol, Subscription<T>>();

  let enabled = true;
  let flushing = false;
  let initialized = false;

  async function dequeue() {
    if (queue.length === 0) {
      flushing = false;
      return;
    }

    const fn = queue.shift();
    await fn?.();
    dequeue();
  }

  function createMethod(key: keyof T & string) {
    if (!isAsyncFunction(config[key])) {
      return function executeSyncMethod(...args: Parameters<T[keyof T]>) {
        try {
          if (key === INITIALIZE_KEY) {
            if (initialized) {
              throw InitializeError;
            } else {
              initialized = true;
            }
          } else if (isUndefined(config.initialize)) {
            initialized = true;
          }

          const fn = config[key] as Fn;

          const result = fn(...args);

          if (enabled) {
            // eslint-disable-next-line no-restricted-syntax
            for (const symbol of Object.getOwnPropertySymbols(subscriptions)) {
              try {
                const subscription = subscriptions[symbol];
                subscription[key]?.(result, ...args);
                subscription.all?.<keyof T>(key, result, ...args);
              } catch {
                /* empty */
              }
            }
          }

          return result;
        } catch (error) {
          // eslint-disable-next-line no-restricted-syntax
          for (const symbol of Object.getOwnPropertySymbols(subscriptions)) {
            try {
              const subscription = subscriptions[symbol];
              subscription.catch?.<keyof T>(key, error as Error, ...args);
            } catch {
              /* empty */
            }
          }

          throw error;
        }
      };
    }

    return async function enqueueAsyncMethod(...args: Parameters<T[keyof T]>) {
      return new Promise((resolve, reject) => {
        async function settle() {
          try {
            const fn = config[key];

            const result = await fn(...args);

            if (enabled) {
              // eslint-disable-next-line no-restricted-syntax
              for (const symbol of Object.getOwnPropertySymbols(
                subscriptions,
              )) {
                const subscription = subscriptions[symbol];
                try {
                  // eslint-disable-next-line no-await-in-loop
                  await Promise.allSettled([
                    subscription[key]?.(result, ...args),
                    subscription.all?.<keyof T>(key, result, ...args),
                  ]);
                } catch {
                  /* empty */
                }
              }
            }

            resolve(result);
          } catch (error) {
            // eslint-disable-next-line no-restricted-syntax
            for (const symbol of Object.getOwnPropertySymbols(subscriptions)) {
              try {
                const subscription = subscriptions[symbol];
                // eslint-disable-next-line no-await-in-loop
                await subscription?.catch?.<keyof T>(
                  key,
                  error as Error,
                  ...args,
                );
              } catch {
                /* empty */
              }
            }

            reject(error);
          }
        }

        if (key === INITIALIZE_KEY) {
          if (initialized) {
            reject(InitializeError);
            return;
          } else {
            initialized = true;
            queue.unshift(settle);
          }
        } else {
          if (isUndefined(config.initialize)) {
            initialized = true;
          }

          queue.push(settle);
        }

        if (!initialized || flushing) {
          return;
        }

        flushing = true;

        dequeue();
      });
    };
  }

  const properties = Object.keys(config).reduce(
    (accumulator, key) => ({
      ...accumulator,
      [key]: isFunction(config[key]) ? createMethod(key) : config[key],
    }),
    {},
  );

  return {
    ...(properties as T),

    __SUBSCRIPTIONS__: subscriptions,

    get enabled() {
      return enabled;
    },

    get flushing() {
      return flushing;
    },

    get initialized() {
      return initialized;
    },

    disable() {
      enabled = false;
    },

    enable() {
      enabled = true;
    },

    subscribe(subscription: Subscription<T>) {
      const key = Symbol(uuid());

      subscriptions[key] = subscription;

      return function unsubscribe() {
        if (flushing) {
          queue.push(async () => {
            delete subscriptions[key];
          });

          return;
        }

        delete subscriptions[key];
      };
    },
  } as const;
}
