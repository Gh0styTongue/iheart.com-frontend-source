import { isEqual } from 'lodash-es';
import { useMemo, useRef } from 'react';
import type { Required } from 'utility-types';
import type { TargetingValues } from 'ads/types';

const parseTargetingValues = <
  FnTargetingValues extends Partial<TargetingValues>,
>(
  targetingValues: FnTargetingValues,
): Required<FnTargetingValues> =>
  Object.fromEntries(
    Object.entries(targetingValues).map(([key, value]) => [key, value ?? null]),
  ) as Required<FnTargetingValues>;

const useTargetingValues = <
  HookTargetingValues extends Partial<TargetingValues>,
>(
  defaultValues: Required<HookTargetingValues>,
  buildTargetingValues: () => Partial<HookTargetingValues>,
): Required<HookTargetingValues> => {
  const DEFAULT_VALUES = useMemo(() => ({ ...defaultValues }), []);
  const targetingValuesRef = useRef<Partial<TargetingValues>>(DEFAULT_VALUES);

  const newTargetingValues = buildTargetingValues();
  if (!isEqual(newTargetingValues, targetingValuesRef.current)) {
    targetingValuesRef.current = newTargetingValues;
  }

  return useMemo<Required<HookTargetingValues>>(
    () => ({
      ...DEFAULT_VALUES,
      ...parseTargetingValues(targetingValuesRef.current),
    }),
    // DEFAULT_VALUES is memoized and targetingValuesRef.current is reassigned above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [targetingValuesRef.current],
  );
};

export default useTargetingValues;
