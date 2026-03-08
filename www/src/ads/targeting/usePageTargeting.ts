import useTargetingValues from 'ads/targeting/lib/useTargetingValues';
import { DEFAULT_PAGE_TARGETING_VALUES } from './constants';
import { getResourceId } from 'state/Routing/selectors';
import { useSelector } from 'react-redux';
import type { PageTargetingValues, TargetingHook } from 'ads/targeting/types';

// TODO: Set all targeting value types in one place to prevent overlap.

const buildSeedValue = (resource: any): PageTargetingValues['seed'] => {
  if (typeof resource === 'string') {
    return resource || null;
  }
  if (typeof resource === 'number' && !Number.isNaN(resource)) {
    return String(resource);
  }
  if (typeof resource?.id === 'string') {
    return resource.id || null;
  }
  return null;
};

const usePageTargeting: TargetingHook<PageTargetingValues> = adsConfig => {
  const {
    pageInfo: { targeting },
  } = adsConfig;

  const seed = buildSeedValue(useSelector(getResourceId));

  return useTargetingValues(DEFAULT_PAGE_TARGETING_VALUES, () => {
    if (targeting) {
      return {
        seed,
        ...targeting,
        ...((
          targeting.name !== undefined && targeting.ccrcontent1 === undefined
        ) ?
          { ccrcontent1: targeting.name }
        : {}),
        ...((
          targeting.modelId !== undefined && targeting.ccrcontent3 === undefined
        ) ?
          { ccrcontent3: targeting.modelId }
        : {}),
      };
    }

    return {};
  });
};

export default usePageTargeting;
