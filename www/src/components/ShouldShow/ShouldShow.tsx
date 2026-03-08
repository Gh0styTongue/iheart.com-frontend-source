import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  hiddenElement?: ReactNode;
  shouldShow?: boolean;
};

function ShouldShow({
  shouldShow = false,
  hiddenElement = null,
  children,
}: Props) {
  const element = hiddenElement || null;
  return <>{shouldShow ? children : element}</>;
}

export default ShouldShow;
