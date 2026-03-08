export default class AdsPlaybackStore<T> {
  state: T;

  constructor(initialState: T) {
    this.state = { ...initialState };
    this.getState = this.getState.bind(this);
    this.setState = this.setState.bind(this);
  }

  getState() {
    return this.state;
  }

  setState(nextState: Partial<T>) {
    this.state = {
      ...this.state,
      ...nextState,
    };
  }

  // *[Symbol.iterator]() {
  //   yield this.getState;
  //   yield this.setState;
  // }
}
