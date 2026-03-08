import * as React from 'react';
import { createContext } from 'react';
import type { IGetTranslateFunctionResponse } from 'redux-i18n';

function defaultTranslateFunction(
  textKey: string | Array<string>,
  _params?: { [param: string]: React.ReactNode },
  _comment?: string,
): string {
  return typeof textKey === 'string' ? textKey : textKey.join(' ');
}

const TranslateContext = createContext<IGetTranslateFunctionResponse>(
  defaultTranslateFunction,
);

export default TranslateContext;
