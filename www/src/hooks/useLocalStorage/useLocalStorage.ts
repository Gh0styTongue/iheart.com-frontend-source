import localStorage from 'utils/localStorage';
import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

function useLocalStorage<T>(
  key: string,
  fallback: T,
): [T, Dispatch<SetStateAction<T>>] {
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() =>
    localStorage.getItem<T>(key, fallback),
  );

  const setValue: Dispatch<SetStateAction<T>> = value => {
    // Allow value to be a function so we have same API as useState
    const valueToStore = value instanceof Function ? value(storedValue) : value;

    localStorage.setItem(key, value);
    setStoredValue(valueToStore);
  };

  return [storedValue, setValue];
}

export default useLocalStorage;
