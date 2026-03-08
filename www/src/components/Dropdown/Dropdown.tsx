import Container from './primitives/Container';
import Dots from 'styles/icons/Dots';
import DropdownContent from './DropdownContent';
import ShouldShow from 'components/ShouldShow';
import TriggerWrapper from './primitives/TriggerWrapper';
import { ReactNode } from 'react';
import { Rules } from 'styles/types';

type Props = {
  children: ReactNode;
  className?: string;
  customId?: string;
  dataTest?: string;
  disabled?: boolean;
  extendDown?: boolean;
  role?: string;
  styles?: Rules;
  triggerBtn?: ReactNode;
};

function Dropdown({
  children,
  className = '',
  customId = '',
  dataTest,
  disabled = false,
  extendDown = false,
  role,
  styles = {},
  triggerBtn = <Dots />,
}: Props) {
  return (
    <Container
      className={className}
      data-test={dataTest}
      role={role}
      style={styles}
    >
      <TriggerWrapper
        data-test="dropdown-trigger-wrapper"
        extendDown={extendDown}
      >
        {triggerBtn}
      </TriggerWrapper>
      <ShouldShow shouldShow={!disabled}>
        <DropdownContent
          customId={customId}
          dataTest="dropdown-item"
          extendDown={extendDown}
        >
          {children}
        </DropdownContent>
      </ShouldShow>
    </Container>
  );
}

export default Dropdown;
