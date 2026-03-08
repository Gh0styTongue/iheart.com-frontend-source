import NavLink from 'components/NavLink';
import { noop } from 'lodash-es';
import { parse } from 'url';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  classes?: Array<string>;
  onClick?: (event: any) => void;
  title: string;
  to: string;
};

function SearchLink({
  to,
  onClick = noop,
  title,
  classes = [''],
  children,
}: Props) {
  return (
    <NavLink
      classes={classes}
      onClick={onClick}
      target={!!to && parse(to).hostname ? '_blank' : undefined}
      to={to}
    >
      {children || title}
    </NavLink>
  );
}

export default SearchLink;
