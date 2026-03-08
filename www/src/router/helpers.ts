import nodeUrl from 'url';
import viewError404 from 'components/Errors/404';
import viewError500 from 'components/Errors/500';
import { CONTEXTS } from 'modules/Logger';
import { get, pick } from 'lodash-es';
import { getRouting } from 'state/Routing/selectors';
import { getTimeUntilShiftChange } from 'state/Live/selectors';
import { Request, Response } from 'express';
import { Route } from 'state/Routing/types';
import { Selector } from 'state/types';
import { State } from 'state/buildInitialState';

export function parseErrors(err: { response: Record<string, any> }) {
  const { response = {} } = err;
  // we default statusText to err here because javascript errors don't have a status text prop and are basically strings
  const { status = 500, statusText = err } = response;
  return { code: status, statusText, ...err };
}

export function getErrorComponent(code: number) {
  if (!code) return null;

  return code >= 400 && code < 500 ? viewError404 : viewError500;
}

// returns correct url if the pathname or query are incorrect and require a redirect, otherwise returns the empty string.
export function getCorrectUrl(
  state: State,
  correctPathSelector: Selector<string | null> | undefined | null,
  pathname: string,
  query: Record<string, string> = {},
  params: any,
  hash?: string,
): string | null {
  const routeIsDynamic = params && !!Object.keys(params).length;
  if (!correctPathSelector && routeIsDynamic) {
    return null;
  }

  const { query: correctQuery = {}, pathname: correctPath } = nodeUrl.parse(
    (correctPathSelector && correctPathSelector(state)) ||
      pathname.toLowerCase(),
    true,
  );

  if (
    pathname === correctPath &&
    Object.keys(correctQuery).every(key => correctQuery[key] === query[key])
  ) {
    return null;
  }

  return nodeUrl.format({
    pathname: correctPath,
    query: {
      ...query,
      ...correctQuery,
    },
    hash,
  });
}

export function serverLog(
  state: State,
  req: Request,
  routeObj: Route,
  type: string | Array<string>,
  message?: any,
): [Array<string>, Record<string, any>] {
  // AV - 10/26/18 - WEB-12402
  // TODO: WEB-12498 - move attaching at least some of this data into the logger or a related middleware/transform.  Plot out a better logging strategy.
  return [
    Array.isArray(type) ? [CONTEXTS.SERVER, ...type] : [CONTEXTS.SERVER, type],
    {
      message,
      requestState: {
        config: pick(get(req, 'appConfig', {}), [
          'countryCode',
          'featureFlags',
          'supportedCountries',
          'web_site_url',
          'web_ad_env',
        ]),
        matchedRoute: routeObj,
        req: pick(req, ['originalUrl', 'headers', 'query']),
        routingState: getRouting(state),
      },
    },
  ];
}

export function filterRoutes(route: Route, state: State) {
  if (!route) return null;

  const { active } = route;

  // if active function exists, then pass countryCode, env, and state in order to function
  // then the function will return whether route is enabled or not otherwise default enabled
  const routeActive = !!active && !!state ? active(state) : true;
  if (!routeActive) return null;

  return route;
}

export function setHeaderOverrides({
  res,
  state,
}: {
  res: Response;
  state: State;
}) {
  // check for dynamic cache control from Live pages
  let timeUntilShiftChange = getTimeUntilShiftChange(state);
  if (timeUntilShiftChange !== undefined) {
    // If the stop time of nowOn Live Station is in the past, don't cache the page until On Air Schedule is updated
    timeUntilShiftChange = Math.max(0, timeUntilShiftChange);
    res.set({
      'Cache-Control': `max-age=${timeUntilShiftChange}`,
      'Edge-Control': `cache-maxage=${timeUntilShiftChange}`,
    });
  }
}
