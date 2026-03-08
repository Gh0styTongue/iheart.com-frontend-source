/**
 * There are circumstances under which we only want to run a side-effect once a component mounts.
 * This abstraction has more semantic meaning and removes the requirement for always having to
 * annotate our effects with eslint-disable comments.
 */

import { useEffect } from 'react';

function useMount(cb: () => void | (() => void)): void {
  useEffect(cb, []);
}

export default useMount;
