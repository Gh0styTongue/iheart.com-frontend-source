import { useEffect, useMemo, useRef, useState } from 'react';

export default function useActiveWindow(initialValue = false): {
  isActiveWindow: boolean;
  activeWindowChanged: boolean;
} {
  const windowWasActive = useRef<boolean>(initialValue);
  const [isVisible, setIsVisible] = useState<boolean>(initialValue);

  const visibilitychange = () => setIsVisible(!document.hidden);

  // this is here to confirm that the initial values are correct after a server-side render
  useEffect(() => {
    if (!document.hidden !== isVisible) {
      setIsVisible(!isVisible);
    }
  }, [isVisible, setIsVisible]);

  useEffect(() => {
    document.addEventListener('visibilitychange', visibilitychange);

    return () => {
      document.removeEventListener('visibilitychange', visibilitychange);
    };
  }, [setIsVisible]);

  const isActiveWindow = isVisible;
  const activeWindowChanged = windowWasActive.current !== isActiveWindow;

  windowWasActive.current = isActiveWindow;

  return useMemo(() => {
    return {
      isActiveWindow,
      activeWindowChanged,
    };
  }, [isActiveWindow, activeWindowChanged]);
}
