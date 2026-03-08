import Link from 'components/NavLink';
import type { MouseEvent } from 'react';

type Props = {
  className?: string;
  dataTest?: string;
  link?: {
    href: string;
    text: string;
  };
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
};

function PlayButtonLink(props: Props) {
  const { onClick, className, link, dataTest } = props;
  const { text, href } = link ?? {};

  return (
    <Link className={className} dataTest={dataTest} onClick={onClick} to={href}>
      {text}
    </Link>
  );
}

export default PlayButtonLink;
