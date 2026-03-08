/**
 * Run of the mill Queue implementation. Used by the Analytics module to queue up track calls while waiting for the prerequesite resources to load (the Adobe JS library, AMP data, etc.)
 */
export default class Queue<T> {
  _queue: Array<T>;

  constructor() {
    this._queue = [];
  }

  enqueue(item: T) {
    if (item !== undefined && item !== null) {
      this._queue.push(item);
    }
  }

  dequeue(): T | undefined {
    return this._queue.shift();
  }

  get size() {
    return this._queue.length;
  }

  get length() {
    return this._queue.length;
  }

  flush() {
    const queueItems = this._queue;
    this._queue = [];
    return queueItems;
  }
}
