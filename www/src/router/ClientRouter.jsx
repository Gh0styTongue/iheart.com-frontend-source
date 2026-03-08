import * as themeApi from 'state/Theme/services';
import AllRoutes, { WwRoutes } from 'router/Routes/routes';
import App from 'views/App/App';
import COUNTRY_CODES from 'constants/countryCodes';
import factory from 'state/factory';
import hub, { E } from 'shared/utils/Hub';
import InApp from 'views/InApp/InApp';
import logger, { CONTEXTS } from 'modules/Logger';
import qs from 'qs';
import { BrowserRouter, Switch } from 'react-router-dom';
import {
  changeLocation,
  navigate,
  resetServerErrors,
  setPageInfo,
  setServerError as setServerErrorAction,
} from 'state/Routing/actions';
import { ConnectedModals } from 'state/UI/constants';
import { filterRoutes, getCorrectUrl, getErrorComponent } from './helpers';
import { getCountryCode } from 'state/Config/selectors';
import { getEnvironment } from 'state/Environment/selectors';
import { getErrorCode } from 'state/Routing/selectors';
import { getLang } from 'state/i18n/selectors';
import { openModal } from 'state/UI/actions';
import { Redirect, Route, withRouter } from 'react-router';
import { useEffect, useRef, useState } from 'react';

const { urls } = window.BOOT;
const store = factory();
let isInitialRender = true;

themeApi.configure(urls);

const { isInApp } = getEnvironment(store.getState());
const InAppWrapper = isInApp ? InApp : null;
const Wrapper = withRouter(InAppWrapper || App);
const lang = getLang(store.getState());
const countryCode = getCountryCode(store.getState());

const ClientRouter = () => {
  /**
   * This ref is used to track the current pathname, so that we know to reset server errors if
   * a user navigates. We don't need to keep this in state, as we don't want to re-render when
   * this value updates
   */
  const pathnameRef = useRef(window?.location?.pathname ?? '');
  /**
   * This state is now being handled in react rather than redux, because
   * it allows us to re-render safely without needing to dispatch a navigate, which led to
   * some unusual race conditions. This state is still initially dependent on redux
   * so that the server can tell the client if a page had a 404 or 500 error
   */
  const [serverError, setServerError] = useState(
    getErrorCode(store.getState()),
  );
  const lastPathRef = useRef('');

  useEffect(() => {
    if (serverError) {
      store.dispatch(setServerErrorAction({ code: serverError }));
    } else {
      store.dispatch(resetServerErrors());
    }
  }, [serverError]);

  useEffect(() => {
    const showCanadaPrivacyModal = JSON.parse(
      localStorage.getItem('showCanadaPrivacyModal') ?? 'false',
    );

    if (showCanadaPrivacyModal) {
      store.dispatch(
        openModal({ id: ConnectedModals.CanadaPrivacy, context: {} }),
      );
    }
  }, []);

  return (
    <BrowserRouter>
      <Wrapper lang={lang} store={store} urls={urls}>
        <Switch>
          {(countryCode === COUNTRY_CODES.WW ? WwRoutes : AllRoutes)
            .filter(route => filterRoutes(route, store.getState()))
            .map((route, i) => {
              const {
                component,
                exact,
                inapp,
                path,
                redirect,
                strict,
                pathCorrection,
              } = route;
              /* eslint-disable react/no-array-index-key */
              if (redirect) {
                return (
                  <Route
                    exact
                    key={i}
                    path={path}
                    render={props => {
                      const { pathname, search } = props.location;
                      const query =
                        search ? qs.parse(search.replace('?', '')) : {};
                      const urlParsed = { pathname, query };
                      const redirectPath =
                        typeof redirect === 'function' ?
                          redirect(urlParsed)
                        : redirect;

                      return (
                        <Redirect to={{ pathname: redirectPath, search }} />
                      );
                    }}
                  />
                );
              }

              return (
                <Route
                  exact={exact}
                  key={i}
                  path={path}
                  render={locationObject => {
                    const initialRender = isInitialRender;
                    isInitialRender = false;
                    store.dispatch(setPageInfo(null));

                    const { location, match } = locationObject;
                    const { search, pathname, key, hash } = location;
                    const query =
                      search ? qs.parse(search.replace('?', '')) : {};
                    const InAppComponent = isInApp && inapp ? inapp : null;
                    let ComponentToRender = InAppComponent || component;

                    if (pathname !== pathnameRef.current) {
                      pathnameRef.current = pathname;

                      if (serverError) {
                        setServerError(null);
                      }
                    }

                    if (serverError)
                      ComponentToRender = getErrorComponent(serverError);

                    const { getAsyncData, pageInfo } = ComponentToRender;

                    const alreadyFetched = key === lastPathRef.current;
                    if (!alreadyFetched) lastPathRef.current = key;

                    const shouldLoadAsyncData =
                      typeof getAsyncData === 'function' && !initialRender;

                    new Promise(resolve => {
                      // Loading asyncProps if present in Component statics
                      if (shouldLoadAsyncData && !alreadyFetched) {
                        store.dispatch(changeLocation(locationObject));
                        return store
                          .dispatch(getAsyncData())
                          .then((componentProps = {}) => {
                            logger.info(
                              [CONTEXTS.ROUTER, 'getAsyncData', 'Resolved'],
                              componentProps,
                            );
                            const { notFound, redirectUrl } = componentProps;
                            if (redirectUrl) {
                              store.dispatch(
                                navigate({ path: redirectUrl, replace: true }),
                              );
                              resolve(true);

                              return;
                            }

                            if (notFound) {
                              setServerError(404);
                              resolve(false);
                              return;
                            }
                            // some of our routes allow for some ambiguity since titles get encoded alongside ids, if the url we get isn't
                            // the officially correct one for the id/s that we're given then redirect to the correct one.
                            const correctUrl = getCorrectUrl(
                              store.getState(),
                              pathCorrection,
                              pathname,
                              query,
                              match.params,
                              hash,
                            );
                            if (correctUrl) {
                              store.dispatch(
                                navigate({ path: correctUrl, replace: true }),
                              );
                              resolve(true);
                              return;
                            }

                            resolve(false);
                          })
                          .catch(e => {
                            const errObj =
                              e instanceof Error ? e : new Error(e);
                            logger.error(
                              [CONTEXTS.ROUTER, 'getAsyncData', 'Rejected'],
                              e,
                              {},
                              errObj,
                            );
                            const { response } = e;
                            const { status } = response || {};

                            setServerError(status || 500);
                            resolve(false);
                          });
                      }

                      return resolve(false);
                    }).then(didRedirect => {
                      if (!didRedirect) {
                        store.dispatch(changeLocation(locationObject)); // we want to make sure this only fires once
                        if (!alreadyFetched) {
                          const adsData = {
                            ...(pageInfo ? pageInfo(store.getState()) : {}),
                            routeKey: locationObject.location.key,
                            initialRender,
                          };
                          hub.trigger(E.PAGE_RENDERED, adsData);
                          store.dispatch(setPageInfo(adsData));
                        }
                      }
                    });

                    if (!shouldLoadAsyncData && !alreadyFetched) {
                      store.dispatch(changeLocation(locationObject)); // we want to make sure this only fires once
                    }

                    return <ComponentToRender />;
                    /* eslint-enable */
                  }}
                  strict={strict}
                />
              );
            })}
        </Switch>
      </Wrapper>
    </BrowserRouter>
  );
};

export default ClientRouter;
