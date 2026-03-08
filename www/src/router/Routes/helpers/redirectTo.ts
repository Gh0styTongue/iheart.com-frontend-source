import { Route } from 'router/types';

/**
 * Over-write routes to redirect to somewhere else.
 */
const redirectTo = (route: Route, redirect: '', status = 302) => {
  const { path, exact } = route;
  return path ?
      {
        exact,
        path,
        redirect,
        status,
      }
    : route;
};

export default redirectTo;
