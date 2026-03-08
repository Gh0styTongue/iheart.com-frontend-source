import CaretUpDown from 'styles/icons/CaretUpDown';
import theme from 'styles/themes/default';
import { useMemo } from 'react';

type Props = {
  direction: 'up' | 'down';
};

function Caret({ direction }: Props) {
  const style = useMemo(
    () => ({
      height: '1.5rem',
      marginLeft: '0.8rem',
      marginTop: direction === 'down' ? '0.25rem' : '0',
    }),
    [direction],
  );

  return (
    <CaretUpDown
      color={theme.colors.black.secondary}
      css={style}
      direction={direction}
    />
  );
}

export default Caret;
