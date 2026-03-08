function removeLocalStorage(key: string, onError?: (err: Error) => void): void {
  try {
    localStorage.removeItem(key);
  } catch (e: any) {
    if (onError) {
      onError(e);
    }
  }
}

export default removeLocalStorage;
