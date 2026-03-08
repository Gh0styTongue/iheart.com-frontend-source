import axios from 'axios';
import logger, { CONTEXTS } from 'modules/Logger';

const defaultTimeout = 6_000;

const defaultMessage = 'Request canceled due to time out';

const createAxiosCancelToken = (message?: string, timeout?: number) =>
  new axios.CancelToken(cancel => {
    const t = timeout ?? defaultTimeout;
    // Results in either: "Request canceled due to timeout" or "Request canceled due to timeout: AMP request timed out"
    const m = defaultMessage + (message ? `: ${message}` : '');

    if (timeout) {
      setTimeout(() => {
        logger.error(
          [CONTEXTS.TRANSPORT, __CLIENT__ ? CONTEXTS.CLIENT : CONTEXTS.SERVER],
          m,
        );
        cancel(m);
      }, t);
    }
  });

export default createAxiosCancelToken;
