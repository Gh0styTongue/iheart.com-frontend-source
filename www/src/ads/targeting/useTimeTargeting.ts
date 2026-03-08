import type { TargetingHook } from 'ads/targeting/types';

export type TimeTargetingValues = {
  ord: string;
  ts: string;
};

const useTimeTargeting: TargetingHook<TimeTargetingValues> = () => {
  const now = Date.now();
  return {
    ord: String(now),
    ts: String(now),
  };
};

export default useTimeTargeting;
