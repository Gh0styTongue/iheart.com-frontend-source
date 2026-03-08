import getRadioEditRedirect from 'router/getRadioEditRedirect';
import { GetAsyncData } from 'state/types';
import { getPath, getQueryParams } from 'state/Routing/selectors';
import { getSiteUrl, getWebGraphQlUrl } from 'state/Config/selectors';

export const getAsyncData: GetAsyncData =
  () =>
  async (_dispatch, getState, { transport }) => {
    const state = getState();

    const { httpStatus, url } = await getRadioEditRedirect(transport, {
      apiEndpoint: getWebGraphQlUrl(state),
      originalQuery: getQueryParams(state),
      pathname: getPath(state),
      siteUrl: getSiteUrl(state),
    });

    if (!url) return { notFound: true };

    return {
      redirectUrl: url,
      routeStatus: httpStatus,
    };
  };
