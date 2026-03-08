import NavLink from 'components/NavLink';
import type { ReactNode } from 'react';

type Props = {
  children?: ReactNode;
  hidden?: boolean;
  to?: string;
};

function Line({ children, hidden = false, to }: Props) {
  if (!children || hidden) return null;
  return (
    <p data-test="line-text">
      {to ?
        <NavLink to={to}>{children}</NavLink>
      : children}
    </p>
  );
}

export default Line;
