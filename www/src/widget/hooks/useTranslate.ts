import logger, { CONTEXTS } from 'widget/logger';
import Translation from 'widget/contexts/Translation';
import { identity } from 'lodash-es';
import { useContext } from 'react';
import type { IGetTranslateFunctionResponse } from 'redux-i18n';

function useTranslations(): IGetTranslateFunctionResponse {
  const translate = useContext(Translation.Context);

  if (!translate || typeof translate !== 'function') {
    const errObj = new Error(
      `'translate' function is not available via context, is the proper provider component in place?`,
    );
    logger.error(CONTEXTS.TRANSLATION, errObj.message, {}, errObj);
  }

  return translate || identity;
}

export default useTranslations;
