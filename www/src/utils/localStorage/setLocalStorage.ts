import safeStringify from 'utils/safeStringify';

function setLocalStorage(
  key: string,
  value: unknown,
  onError?: (err: Error) => void,
): void {
  try {
    localStorage.setItem(key, safeStringify(value));
  } catch (e: any) {
    if (onError) {
      onError(e);
    }
  }
}

export default setLocalStorage;
