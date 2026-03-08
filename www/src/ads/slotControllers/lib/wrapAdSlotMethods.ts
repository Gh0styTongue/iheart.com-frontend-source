/* eslint-disable @typescript-eslint/no-non-null-assertion */
import debouncePromiseFirstLast from 'ads/slotControllers/lib/debouncePromiseFirstLast';
import logger, { CONTEXTS } from 'modules/Logger';
import type {
  AdSlotControllerInstance,
  AdSlotControllerName,
} from 'ads/slotControllers/types';

/**
 * Configuration for the wrapped slot.
 */
type Options = {
  /**
   * For testing, disabled checking the execution order.
   */
  _disableExecutionChecking?: boolean;
  /**
   * A required error handler.
   */
  onError?: (err: Error) => void;
};

/**
 * Wrap SYNCronous function in a try / catch.
 */
const createSyncErrorWrapper =
  (controllerName: AdSlotControllerName, errorHandler: Options['onError']) =>
  (fn: (...args: Array<any>) => void) =>
  (...args: Array<any>): void => {
    try {
      fn(...args);
    } catch (err: any) {
      logger.error([CONTEXTS.ADS, controllerName], err);
      errorHandler?.(err);
    }
  };

/**
 * Attach a catch handler to ASYNCronous function.
 */
const createAsyncErrorWrapper =
  (controllerName: AdSlotControllerName, errorHandler: Options['onError']) =>
  (fn: (...args: Array<any>) => Promise<void>) =>
  (...args: Array<any>): Promise<void> =>
    fn(...args)
      .catch(err => {
        logger.error([CONTEXTS.ADS, controllerName], err);
        errorHandler?.(err);
      })
      .then(() => Promise.resolve());

/**
 * Each ad slot controller utilizes the same methods, presumably in the same order.
 * Let's wrap these and throw if that order is off.
 */
const wrapAdSlotMethods = <
  AdSlotControllerProvided extends () => AdSlotControllerInstance,
>(
  adSlotController: AdSlotControllerProvided,
  options: Options,
): ReturnType<AdSlotControllerProvided> => {
  const {
    _disableExecutionChecking: isExecutionCheckingDisabled = false,
    onError: errorCallback,
  } = options;

  const adSlotControllerInstance = adSlotController();

  const { name } = adSlotControllerInstance;

  const syncErrorWrapper = createSyncErrorWrapper(name, errorCallback);
  const asyncErrorWrapper = createAsyncErrorWrapper(name, errorCallback);

  // Debounce our refresh method so all calls between the first and the last are ignored.
  const debouncedRefresh = debouncePromiseFirstLast((...args) =>
    adSlotControllerInstance.refresh(...args),
  );

  let isInitialized = false;
  let isAdUnitSet = false;
  let isTargetingSet = false;
  let isRefreshed = false;
  let isDestroyed = false;

  const checkIfAdUnitSet = () => {
    if (
      adSlotControllerInstance.setAdUnit &&
      !isExecutionCheckingDisabled &&
      isAdUnitSet !== true
    ) {
      throw new Error(`Controller "${name}" has not yet set an ad unit.`);
    }
  };

  const checkIfTargetingSet = () => {
    if (
      adSlotControllerInstance.setTargeting &&
      !isExecutionCheckingDisabled &&
      isTargetingSet !== true
    ) {
      throw new Error(`Controller "${name}" has not yet set targeting.`);
    }
  };

  const checkIfInitialized = () => {
    if (!isExecutionCheckingDisabled && isInitialized !== true) {
      throw new Error(`Controller "${name}" has not yet been initialized.`);
    }
  };

  const checkIfRefreshed = () => {
    if (!isExecutionCheckingDisabled && isRefreshed !== true) {
      throw new Error(`Controller "${name}" has not yet been refreshed.`);
    }
  };

  const checkIfDestroyed = () => {
    if (!isExecutionCheckingDisabled && isDestroyed === true) {
      throw new Error(`Controller "${name}" has been destroyed.`);
    }
  };

  const wrappedAdSlotControllerInstance: AdSlotControllerInstance = {
    ...adSlotControllerInstance,

    initialize: syncErrorWrapper((...args) => {
      checkIfDestroyed();
      if (!isExecutionCheckingDisabled && isInitialized) {
        throw new Error(`Controller "${name}" has already been initialized.`);
      }
      isInitialized = true;
      adSlotControllerInstance.initialize(
        ...(args as Parameters<
          NonNullable<AdSlotControllerInstance['initialize']>
        >),
      );
    }),

    ...(adSlotControllerInstance.setAdUnit !== undefined ?
      {
        setAdUnit: syncErrorWrapper((...args) => {
          checkIfDestroyed();
          checkIfInitialized();
          isAdUnitSet = true;
          adSlotControllerInstance.setAdUnit!(
            ...(args as Parameters<
              NonNullable<AdSlotControllerInstance['setAdUnit']>
            >),
          );
        }),
      }
    : {}),

    ...(adSlotControllerInstance.setTargeting !== undefined ?
      {
        setTargeting: syncErrorWrapper((...args) => {
          checkIfDestroyed();
          checkIfInitialized();
          isTargetingSet = true;
          adSlotControllerInstance.setTargeting!(
            ...(args as Parameters<
              NonNullable<AdSlotControllerInstance['setTargeting']>
            >),
          );
        }),
      }
    : {}),

    ...(adSlotControllerInstance.setEnabledHeaderBidders !== undefined ?
      {
        setEnabledHeaderBidders: syncErrorWrapper((...args) => {
          checkIfDestroyed();
          checkIfInitialized();
          adSlotControllerInstance.setEnabledHeaderBidders!(
            ...(args as Parameters<
              NonNullable<AdSlotControllerInstance['setEnabledHeaderBidders']>
            >),
          );
        }),
      }
    : {}),

    refresh: asyncErrorWrapper((...args) => {
      checkIfDestroyed();
      checkIfInitialized();
      checkIfAdUnitSet();
      checkIfTargetingSet();
      isRefreshed = true;
      return debouncedRefresh(...args);
    }),

    ...(adSlotControllerInstance.clear !== undefined ?
      {
        clear: asyncErrorWrapper(() => {
          checkIfDestroyed();
          checkIfRefreshed();
          return adSlotControllerInstance.clear!();
        }),
      }
    : {}),

    destroy: asyncErrorWrapper(() => {
      checkIfInitialized();
      checkIfDestroyed();
      isDestroyed = true;
      return adSlotControllerInstance.destroy();
    }),
  };

  return wrappedAdSlotControllerInstance as ReturnType<AdSlotControllerProvided>;
};

export default wrapAdSlotMethods;
