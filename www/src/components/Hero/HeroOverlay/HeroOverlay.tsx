import Overlay from './primitives/Overlay';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  darkBackground?: boolean;
};

export default function HeroOverlay(props: Props) {
  return (
    <Overlay darkBackground={props.darkBackground}>{props.children}</Overlay>
  );
}
