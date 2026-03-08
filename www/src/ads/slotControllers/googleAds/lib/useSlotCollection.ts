import logger, { CONTEXTS } from 'modules/Logger';
import { ControllerNames } from 'ads/slotControllers/types';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { SlotDef } from 'ads/slotControllers/googleAds/useGoogleAdsPassThrough';
import type { SlotInstance } from 'ads/slotControllers/googleAds/types';

export type SlotIdMap<T> = {
  current: Record<string, T>;
  length: number;
  map: <R>(cb: (value: T, key: string) => R) => Array<R>;
  reduce: <R>(
    cb: (memo: R, value: T, slotId: string) => R,
    initialValue: R,
  ) => R;
  some: (cb: (value: T, slotId: string) => boolean) => boolean;
  overwrite: (newCurrent: Record<string, T>) => void;
  set: (slotId: string, value: T) => void;
  get: (slotId: string) => T;
  remove: (slotId: string) => void;
};

export type SlotDefinitions = SlotIdMap<SlotDef>;
export type SlotInstances = SlotIdMap<SlotInstance>;
export type SlotElements = SlotIdMap<HTMLElement>;

function useSlotIdMap<T>(): SlotIdMap<T> {
  const map = useRef<Record<string, T>>({});
  return useMemo(() => {
    function mapToArray<R>(iterator: (value: T, key: string) => R): Array<R> {
      return Object.entries(map.current).map(([slotId, value]) =>
        iterator(value, slotId),
      );
    }
    function reduce<R>(
      iterator: (memo: R, value: T, slotId: string) => R,
      initialValue: R,
    ): R {
      return Object.entries(map.current).reduce<R>(
        (memo: R, [slotId, value]) => iterator(memo, value, slotId),
        initialValue,
      );
    }
    function some(iterator: (value: T, slotId: string) => boolean): boolean {
      return Object.entries(map.current).some(([slotId, value]) =>
        iterator(value, slotId),
      );
    }
    function overwrite(newCurrent: Record<string, T>): void {
      map.current = newCurrent;
    }
    function set(slotId: string, value: T): void {
      map.current = { ...map.current, [slotId]: value };
    }
    function get(slotId: string): T {
      return map.current[slotId];
    }
    function remove(slotId: string): void {
      const filtered = Object.entries(map.current).filter(
        ([id]) => slotId !== id,
      );
      if (filtered.length === Object.keys(map.current).length) return;
      map.current = Object.fromEntries(filtered);
    }

    return {
      set,
      overwrite,
      get,
      remove,
      map: mapToArray,
      reduce,
      some,
      get current() {
        return map.current;
      },
      get length() {
        return Object.keys(map.current).length;
      },
    };
  }, [map]);
}

export default function useSlotCollection({
  onSlotsChanged,
  onSlotInactive,
  onSlotUnmount,
}: {
  onSlotsChanged: (
    slotChangeEvents: Array<{
      slotId: string;
      slotDefChanged: boolean;
      slotNeedsInstantiation: boolean;
      slotDef: SlotDef;
      previousSlotDef: SlotDef;
      slotInstance: SlotInstance;
    }>,
  ) => void;
  onSlotInactive: (
    slotId: string,
    slotDef: SlotDef,
    slotInstance: SlotInstance,
    slotElement: HTMLElement,
  ) => void;
  onSlotUnmount: (
    slotId: string,
    slotDef: SlotDef,
    slotInstance: SlotInstance,
    slotElement: HTMLElement,
  ) => void;
}): {
  passSlotProps: (slotId: string, slotDef: SlotDef) => void;
  slotInactive: (slotId: string) => void;
  unmountSlot: (slotId: string) => void;
  slotDefinitions: SlotIdMap<SlotDef>;
  slotInstances: SlotIdMap<SlotInstance>;
  slotElements: SlotIdMap<HTMLElement>;
  forceRerender: number;
} {
  const definitions = useSlotIdMap<SlotDef>();
  const instances = useSlotIdMap<SlotInstance>();
  const elements = useSlotIdMap<HTMLElement>();

  const slotChangeQueue = useRef<
    Array<{
      slotId: string;
      slotDefChanged: boolean;
      slotNeedsInstantiation: boolean;
      slotDef: SlotDef;
      previousSlotDef: SlotDef;
      slotInstance: SlotInstance;
    }>
  >([]);
  const [forceRerender, setForceRerender] = useState<number>(0);

  const passSlotProps = useCallback(
    (slotId: string, slotDef: SlotDef) => {
      const previousSlotDef = definitions.get(slotId);
      definitions.set(slotId, slotDef);

      const slotDefChanged =
        previousSlotDef &&
        (
          Object.keys({ ...previousSlotDef, ...slotDef }) as Array<
            keyof SlotDef
          >
        ).some(key => {
          return previousSlotDef[key] !== slotDef[key];
        });
      const slotNeedsInstantiation = slotDef && !previousSlotDef;

      const slotChangeEvent = {
        slotId,
        slotDefChanged,
        slotNeedsInstantiation,
        slotDef,
        previousSlotDef,
        slotInstance: instances.get(slotId),
      };

      // because we have three ad layouts on a standard profile page, resizing from one extreme to another causes two ad requests
      // to go out.  To prevent this behavior for fast resizes, we batch the updates ourselves using the logic below
      // (for all other transitions react batches them well enough)
      if (!slotChangeQueue.current.length) {
        slotChangeQueue.current = [slotChangeEvent];
        setTimeout(() => {
          const changeQueue = [...slotChangeQueue.current];
          slotChangeQueue.current = [];
          if (changeQueue.length > 0) {
            logger.info(
              [CONTEXTS.ADS, ControllerNames.Google],
              'flushing slot change queue.',
              {
                slotChangeQueue: changeQueue,
              },
            );
            onSlotsChanged(changeQueue);
            if (
              changeQueue.some(
                ({ slotNeedsInstantiation: needsInstantiation }) =>
                  needsInstantiation,
              )
            ) {
              setForceRerender(forceRerender + 1);
            }
          }
        }, 100);
      } else {
        slotChangeQueue.current = [...slotChangeQueue.current, slotChangeEvent];
      }
    },
    [definitions, instances, forceRerender, setForceRerender, onSlotsChanged],
  );

  const slotInactive = useCallback(
    async (slotId: string) => {
      logger.info(
        [CONTEXTS.ADS, ControllerNames.Google],
        `slot with id: ${slotId} is inactive!`,
      );
      const definition = definitions.current[slotId];
      const instance = instances.current[slotId];
      const element = elements.current[slotId];

      onSlotInactive(slotId, definition, instance, element);
    },
    [definitions, instances, elements, onSlotInactive],
  );

  const unmountSlot = useCallback(
    async (slotId: string) => {
      logger.info(
        [CONTEXTS.ADS, ControllerNames.Google],
        `unmounting slot with id: ${slotId}`,
      );

      const instance = instances.current[slotId];
      const definition = definitions.current[slotId];
      const element = elements.current[slotId];

      if (definition) {
        definitions.remove(slotId);
      }

      if (instance && elements) {
        instances.remove(slotId);
        elements.remove(slotId);
        onSlotUnmount(slotId, definition, instance, element);
      }
    },
    [instances, definitions, elements, onSlotUnmount],
  );

  return {
    slotDefinitions: definitions,
    slotInstances: instances,
    slotElements: elements,
    passSlotProps,
    slotInactive,
    unmountSlot,
    forceRerender,
  };
}
