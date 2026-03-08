function getLocalStorage<T>(key: string, fallback: T): T {
  try {
    const storageItem = localStorage.getItem(key);

    if (!storageItem) {
      return fallback;
    }

    return JSON.parse(storageItem) as T;
  } catch {
    return fallback;
  }
}

export default getLocalStorage;
