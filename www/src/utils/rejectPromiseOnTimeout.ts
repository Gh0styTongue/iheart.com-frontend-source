export default function rejectPromiseOnTimeout(
  promise: Promise<any>,
  timeout: number,
  errorOnTimeout: Error = new Error(`promise timed out after ${timeout} ms!`),
): Promise<any> {
  const timeoutPromise = new Promise((resolve, reject) => {
    setTimeout(() => reject(errorOnTimeout), timeout);
  });

  return Promise.race([promise, timeoutPromise]);
}
