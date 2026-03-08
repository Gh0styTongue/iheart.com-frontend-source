// WEB-8668 on the server we timeout
// after 3 seconds to prevent 504 Gateway Timeouts
// due to downstream api problems
export const TIMEOUT = __CLIENT__ ? 0 : 3000;
