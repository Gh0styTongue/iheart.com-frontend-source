const debouncePromiseFirstLast = (fn: { (...args: Array<any>): void }) => {
  let isRunning = false;
  const argQueue: Array<any> = [];
  const resolveQueue: Array<{ (): void }> = [];

  return async function execute(...args: Array<any>): Promise<void> {
    if (isRunning) {
      argQueue.push(args);
      return new Promise(resolve => resolveQueue.push(() => resolve()));
    }

    isRunning = true;
    await fn(...args);
    isRunning = false;

    if (argQueue.length) {
      const lastArgs = argQueue.pop();
      argQueue.splice(0, Infinity);
      return execute(...lastArgs);
    } else {
      resolveQueue.forEach(resolve => resolve());
      resolveQueue.splice(0, Infinity);
      return Promise.resolve();
    }
  };
};

export default debouncePromiseFirstLast;
