import DescriptionContainer from '../primitives/DescriptionContainer';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  dataTest?: string;
  lines?: number;
};

export default function DefaultDescription({
  children,
  lines = 2,
  dataTest,
}: Props) {
  return React.Children.count(children) > 0 ?
      <DescriptionContainer data-test={dataTest} lines={lines}>
        {children}
      </DescriptionContainer>
    : null;
}
