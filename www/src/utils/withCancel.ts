/* eslint-disable prefer-promise-reject-errors */

export type CancelablePromise<T> = Promise<T> & {
  cancel: () => void;
};

function withCancel<T>(promise: Promise<T>): CancelablePromise<T> {
  let canceled = false;

  const cancelablePromise: Partial<CancelablePromise<T>> = new Promise(
    (resolve, reject) => {
      Promise.resolve(promise)
        .then(val => (canceled ? reject({ canceled }) : resolve(val)))
        .catch((err: any) => reject({ ...err, canceled }));
    },
  );

  cancelablePromise.cancel = () => {
    canceled = true;
  };

  return cancelablePromise as CancelablePromise<T>;
}

export default withCancel;
