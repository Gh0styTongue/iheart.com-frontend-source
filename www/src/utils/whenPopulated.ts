import watch from 'redux-watch';
import type { Selector, Store } from 'state/types';

export default function whenPopulated<Val>(
  store: Store,
  selector: Selector<Val>,
  predicate: (newVal: Val, oldVal?: Val) => boolean = value => !!value,
): Promise<ReturnType<typeof selector>> {
  const currentValue = selector(store.getState());
  if (predicate(currentValue)) return Promise.resolve(currentValue);

  return new Promise(resolve => {
    const watcher = watch(() => selector(store.getState()));
    const unsubscribe = store.subscribe(
      watcher((newVal: Val, oldVal: Val) => {
        if (predicate(newVal, oldVal)) {
          unsubscribe();
          resolve(newVal);
        }
      }),
    );
  });
}
