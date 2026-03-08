import * as React from 'react';
import BackIcon from './primitives/BackIcon';
import NavLink from 'components/NavLink';
import SubHeadingWithIcon from './primitives/SubHeadingWithIcon';

type Props = {
  children: React.ReactNode;
  dataTest: string;
  to: string;
};

const HeadingBackLink = ({ dataTest, to, children }: Props) => (
  <SubHeadingWithIcon data-test={dataTest}>
    <NavLink to={to}>
      <BackIcon data-test="heading-back-icon" /> {children}
    </NavLink>
  </SubHeadingWithIcon>
);

export default HeadingBackLink;
