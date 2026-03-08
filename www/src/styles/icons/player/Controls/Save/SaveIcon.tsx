import usePlayerColor from 'contexts/PlayerColor/usePlayerColor';
import type { CSSProperties } from 'react';

type Props = {
  'data-test'?: string;
  styles?: CSSProperties;
};

function SaveIcon({ 'data-test': dataTest, styles }: Props) {
  const { playerColor } = usePlayerColor();
  return (
    <svg
      aria-label="Save Icon"
      css={{ height: '3.5rem', width: '3.5rem' }}
      data-test={dataTest}
      fill="none"
      height="22"
      role="img"
      style={styles || {}}
      viewBox="0 0 31 22"
      width="31"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17 6.5H2C1.175 6.5 0.5 7.175 0.5 8C0.5 8.825 1.175 9.5 2 9.5H17C17.825 9.5 18.5 8.825 18.5 8C18.5 7.175 17.825 6.5 17 6.5ZM17 0.5H2C1.175 0.5 0.5 1.175 0.5 2C0.5 2.825 1.175 3.5 2 3.5H17C17.825 3.5 18.5 2.825 18.5 2C18.5 1.175 17.825 0.5 17 0.5ZM24.5 12.5V8C24.5 7.175 23.825 6.5 23 6.5C22.175 6.5 21.5 7.175 21.5 8V12.5H17C16.175 12.5 15.5 13.175 15.5 14C15.5 14.825 16.175 15.5 17 15.5H21.5V20C21.5 20.825 22.175 21.5 23 21.5C23.825 21.5 24.5 20.825 24.5 20V15.5H29C29.825 15.5 30.5 14.825 30.5 14C30.5 13.175 29.825 12.5 29 12.5H24.5ZM2 15.5H11C11.825 15.5 12.5 14.825 12.5 14C12.5 13.175 11.825 12.5 11 12.5H2C1.175 12.5 0.5 13.175 0.5 14C0.5 14.825 1.175 15.5 2 15.5Z"
        fill={playerColor}
      />
    </svg>
  );
}

export default SaveIcon;
