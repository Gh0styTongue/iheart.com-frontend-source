import { v4 as uuidv4 } from 'uuid';
import type { GrowlConfigMap } from 'components/Growls/types';
import type { State } from './types';

export function setIsFSPOpen(state: State, isFSPOpen: boolean) {
  return {
    ...state,
    isFSPOpen,
  };
}

export function showGrowl(
  state: State,
  growl: Omit<GrowlConfigMap[keyof GrowlConfigMap], 'id'>,
) {
  return {
    ...state,
    growls: [...state.growls, { ...growl, id: uuidv4() }],
  };
}

export function hideGrowl(state: State, growlId: string) {
  return {
    ...state,
    growls: state.growls.filter(({ id }) => id !== growlId),
  };
}

export function appMounted(state: State): State {
  return {
    ...state,
    appMounted: true,
  };
}

export function hideSideNav(state: State): State {
  return {
    ...state,
    showingSideNav: false,
  };
}

export function showSideNav(state: State): State {
  return {
    ...state,
    showingSideNav: true,
  };
}

export function toggleAccountDropdown(
  state: State,
  showingAccountDropdown: boolean,
) {
  return {
    ...state,
    showingAccountDropdown,
  };
}

export function setModal(state: State, modal: State['modal']): State {
  return {
    ...state,
    modal,
  };
}

export function setIsAdBlocked(state: State, isAdBlocked: boolean): State {
  return {
    ...state,
    isAdBlocked,
  };
}

export function setIsListenInAppVisible(
  state: State,
  isListenInAppVisible: boolean,
): State {
  return {
    ...state,
    isListenInAppVisible,
  };
}
