/* eslint-disable react/no-array-index-key */

import Content from '../primitives/Content';
import DropdownArrow from '../DropdownArrow';
import List from '../primitives/List';
import ShouldShow from 'components/ShouldShow';
import { Children, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  customId?: string;
  dataTest?: string;
  extendDown?: boolean;
};

function DropdownContent({
  children,
  dataTest = '',
  extendDown = false,
  customId = '',
}: Props) {
  return (
    <Content data-test="dropdown-content-wrapper" extendDown={extendDown}>
      <List
        data-test="dropdown-content-list"
        numChildren={Children.count(children)}
      >
        {Children.map(children, (child, index) => (
          <ShouldShow shouldShow={!!child}>
            <li
              data-test={dataTest}
              key={`dropdown--${index}--${dataTest || ''}--${customId || ''}`}
            >
              {child}
            </li>
          </ShouldShow>
        ))}
      </List>
      <DropdownArrow customId={customId} pointUp={extendDown} />
    </Content>
  );
}

export default DropdownContent;
