import { getLang, getTranslations } from './selectors';
import { getTranslateFunction as getReduxI18nTranslateFunction } from 'redux-i18n';
import type { State } from 'state/types';

export function getTranslateFunction(state: State) {
  return getReduxI18nTranslateFunction(getTranslations(state), getLang(state));
}
