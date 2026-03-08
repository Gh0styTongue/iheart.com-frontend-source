import Body1 from 'primitives/Typography/BodyCopy/Body1';
import ShouldShow from 'components/ShouldShow';
import theme from 'styles/themes/default';
import { ButtonsContainer, Content, H4, Wrapper } from './primitives';
import { ComponentType, ReactNode } from 'react';

type IconProps = {
  className?: string;
  color?: string;
  height: string;
  width: string;
};

type Props = {
  buttons?: Array<ReactNode>;
  icon?: ComponentType<IconProps>;
  noMinHeight?: boolean;
  subtitle: string;
  title: string;
};

function EmptyState({ buttons, icon, noMinHeight, subtitle, title }: Props) {
  const Icon: ComponentType<ReactNode> | any = icon || 'span';

  return (
    <Wrapper data-test="empty-state-wrapper" noMinHeight={noMinHeight}>
      <Content>
        <ShouldShow shouldShow={!!icon}>
          <Icon
            color={theme.colors.gray['300']}
            data-test="empty-state-icon"
            height="6rem"
            width="6rem"
          />
        </ShouldShow>

        <H4 data-test="empty-state-title">{title}</H4>

        <Body1 data-test="empty-state-subtitle" textAlign="center">
          {subtitle}
        </Body1>

        <ButtonsContainer data-test="empty-state-buttons">
          {buttons}
        </ButtonsContainer>
      </Content>
    </Wrapper>
  );
}

export default EmptyState;
