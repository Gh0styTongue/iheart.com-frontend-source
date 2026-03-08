import TranslateContext from './index';
import { useContext } from 'react';
import type { IGetTranslateFunctionResponse } from 'redux-i18n';

function useTranslate(): IGetTranslateFunctionResponse {
  return useContext(TranslateContext.Context);
}

export default useTranslate;
