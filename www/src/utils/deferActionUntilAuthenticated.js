import safeStringify from 'utils/safeStringify';

export const DEFERRABLE_ACTION_KEYS = {
  LIVE_TOGGLE_FAVORITE: 'LIVE_TOGGLE_FAVORITE',
};

export function deferActionUntilAuthenticated(defferableActionKey, ...args) {
  sessionStorage.setItem(
    'deferredAction',
    safeStringify({
      action: defferableActionKey,
      args,
    }),
  );
}
