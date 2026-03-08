import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import { Selector } from 'state/types';
import { State } from './types';

const initialThemeState: State = {
  holidayImg: null,
  holidayImgDark: null,
};

export const getTheme: Selector<State> = state =>
  get(state, 'theme', initialThemeState);

export function makeThemeSelector<T>(
  attr: string,
  fallback: T | null | undefined = undefined,
): Selector<T> {
  return createSelector(getTheme, theme => get(theme, attr, fallback));
}

export const getHolidayImgDark: Selector<string | null | undefined> =
  makeThemeSelector('holidayImgDark');

export const getHolidayImg: Selector<string | null | undefined> =
  makeThemeSelector('holidayImg');
