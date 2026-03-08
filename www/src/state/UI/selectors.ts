import { ConnectedModals } from './constants';
import { createSelector } from 'reselect';
import type { GrowlState, State } from './types';
import type { State as RootState } from 'state/types';

export const getUI = (state: RootState): State => state?.ui;

function makeUISelector<T>(fn: (state: State) => T) {
  return createSelector<RootState, State, T>(getUI, fn);
}

export const isShowingSideNav = makeUISelector(ui => ui?.showingSideNav);

export const isShowingWidgetLoginOverflow = makeUISelector(
  ui => ui?.showingWidgetLoginOverflow,
);

export const getAppMounted = makeUISelector(ui => ui?.appMounted);
export const getModal = makeUISelector(ui => ui?.modal);
export const getIsSearchOpen = makeUISelector(
  ui => ui?.modal?.id === ConnectedModals.Search,
);
export const getIsAdBlocked = makeUISelector(ui => ui?.isAdBlocked);
export const getIsListenInAppVisible = makeUISelector(
  ui => ui?.isListenInAppVisible,
);
export const getGrowls = makeUISelector<GrowlState>(ui => ui?.growls ?? []);
