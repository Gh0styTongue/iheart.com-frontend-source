/* eslint-disable sort-keys */

import type { IGetTranslateFunctionResponse } from 'redux-i18n';

type NumericMonth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export function getMonth(
  index: number,
  translate: IGetTranslateFunctionResponse,
) {
  return {
    1: translate('January'),
    2: translate('February'),
    3: translate('March'),
    4: translate('April'),
    5: translate('May'),
    6: translate('June'),
    7: translate('July'),
    8: translate('August'),
    9: translate('September'),
    10: translate('October'),
    11: translate('November'),
    12: translate('December'),
  }[index as NumericMonth];
}

export function formatDate(
  timestamp: Date | number | string,
  translate: IGetTranslateFunctionResponse,
) {
  const date = new Date(timestamp);

  return `${getMonth(
    date.getMonth() + 1,
    translate,
  )} ${date.getDate()}, ${date.getFullYear()}`;
}

export function getShortMonth(
  index: number,
  translate: IGetTranslateFunctionResponse,
) {
  return {
    1: translate('Jan'),
    2: translate('Feb'),
    3: translate('Mar'),
    4: translate('Apr'),
    5: translate('May'),
    6: translate('Jun'),
    7: translate('Jul'),
    8: translate('Aug'),
    9: translate('Sep'),
    10: translate('Oct'),
    11: translate('Nov'),
    12: translate('Dec'),
  }[index as NumericMonth];
}

export function formatDateShort(
  date: Date | number | string,
  translate: IGetTranslateFunctionResponse,
) {
  const newDate = new Date(date);
  return `${getShortMonth(
    newDate.getMonth() + 1, // getMonth returns january as 0, so we have to increment
    translate,
  )} ${newDate.getDate()}, ${newDate.getFullYear()} `;
}

export function formatSongDuration(duration: number) {
  const min = Math.floor(duration / 60);
  const sec = duration % 60;
  const minutes = min > 0 ? `${min} min${min > 1 ? 's' : ''}, ` : '';
  const seconds = sec > 0 ? `${sec} sec${sec > 1 ? 's' : ''}` : '';
  return `${minutes} ${seconds}`;
}

export function formatEpisodeDuration(duration: number) {
  const minutes = Math.floor(duration / 60);
  return minutes > 0 ?
      `${minutes} min${minutes > 1 ? 's' : ''}`
    : `${duration} secs`;
}
