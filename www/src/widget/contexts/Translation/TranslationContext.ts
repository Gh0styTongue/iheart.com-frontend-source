import { createContext } from 'react';
import type { IGetTranslateFunctionResponse } from 'redux-i18n';

const TranslationContext = createContext<IGetTranslateFunctionResponse | null>(
  null,
);

export default TranslationContext;
