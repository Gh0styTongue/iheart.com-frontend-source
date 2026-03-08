import { createSelector } from 'reselect';
import { useSelector } from 'react-redux';
import type { FeatureFlags } from 'state/Features/types';
import type { State as RootState } from 'state/types';

/**
 * Memoized selector to access feature flags redux state
 */
const getFlag = (feature: keyof FeatureFlags, defaultValue = false) =>
  createSelector<RootState, Record<string, boolean>, boolean>(
    state => state?.features?.flags,
    flags => flags?.[feature] ?? defaultValue,
  );

/**
 * A hook to access feature flag state from Redux. The benefit this hook offers
 * over directly using the redux selectors comes from stronger typing
 * around the feature flag keys, improving maintainability
 * and simplifying refactors / cleanup.
 * @param feature feature flag to access
 * @param defaultValue a default / fallback if feature does not exist
 * @returns {boolean} - true if feature is enabled
 *
 * ```ts
 * const isNewFeatureEnabled = useFeature('newFeature'); // boolean
 * ```
 */
const useFeature = <T extends keyof FeatureFlags>(
  feature: T,
  defaultValue = false,
): FeatureFlags[T] =>
  useSelector<RootState, boolean>(getFlag(feature, defaultValue));

export default useFeature;
