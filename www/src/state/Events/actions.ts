import transport from 'api/transport';
import { CONTEXTS } from 'modules/Logger';
import { EVENTS_LOADED } from './constants';
import { get } from 'lodash-es';
import { getEvents as getEventsService } from './services';
import { getLocale } from 'state/i18n/selectors';
import { getWebGraphQlUrl } from 'state/Config/selectors';
import { Thunk } from 'state/types';

// TODO: find a way to call this and return directly to component as props for server side render
export function getEvents(): Thunk<Promise<void>> {
  return async function thunk(dispatch, getState, { logger }) {
    const state = getState();
    const webGraphQlUrl = getWebGraphQlUrl(state);
    const locale = getLocale(state);
    let transportData = {};

    try {
      transportData = await transport(
        getEventsService({ baseUrl: webGraphQlUrl, locale }),
      );
    } catch (e: any) {
      const errObj = e instanceof Error ? e : new Error(e);
      logger.error([CONTEXTS.REDUX, CONTEXTS.EVENTS], e, {}, errObj);
    }

    const responseData = get(transportData, ['data', 'data', 'events'], []);
    dispatch({
      payload: responseData,
      type: EVENTS_LOADED,
    });
  };
}
