import { useEffect } from 'react';

/**
 * Called when a component unmounts. Sugar for `useEffect(() => callback);`.
 */
const useUnmount = (cb: ReturnType<Parameters<typeof useEffect>[0]>) =>
  useEffect(() => cb, []);

export default useUnmount;
