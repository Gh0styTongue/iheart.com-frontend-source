import Header from './primitives/Header';
import Title from './primitives/Title';
import { ReactNode } from 'react';

type Props = {
  children?: ReactNode;
  dataTest?: string;
  title: string;
};

export default function SectionHeader({
  title,
  children = undefined,
  dataTest = undefined,
}: Props) {
  return (
    <Header>
      <Title data-test={dataTest}>{title}</Title>
      {children}
    </Header>
  );
}
