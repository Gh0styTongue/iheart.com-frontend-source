import { Icon, Link, Title } from './primitives';
import { ReactNode } from 'react';

type Props = {
  backLink?: string;
  children: ReactNode;
  showMobileBackIcon?: boolean;
};

function SectionHeaderText({
  backLink = '/your-library/',
  children,
  showMobileBackIcon = true,
}: Props) {
  return (
    <>
      <Link
        dataTest="mobile-back-icon-link"
        shouldShow={showMobileBackIcon}
        to={backLink}
      >
        <Icon />
        {children}
      </Link>
      <Title shouldShow={!showMobileBackIcon}>{children}</Title>
    </>
  );
}

export default SectionHeaderText;
