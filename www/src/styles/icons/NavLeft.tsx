import theme from 'styles/themes/default';

type Props = {
  'data-test'?: string;
  className?: string;
  color?: string;
};

function NavLeft({ color = theme.colors.gray['500'], ...props }: Props) {
  return (
    <svg height="12" viewBox="0 0 8 12" width="8" {...props}>
      <path
        d="M6.90993 0.70998C6.51993 0.31998 5.88993 0.31998 5.49993 0.70998L0.909932 5.29998C0.519932 5.68998 0.519932 6.31998 0.909932 6.70998L5.49993 11.3C5.88993 11.69 6.51993 11.69 6.90993 11.3C7.29993 10.91 7.29993 10.28 6.90993 9.88998L3.02993 5.99998L6.90993 2.11998C7.28993 1.72998 7.28993 1.08998 6.90993 0.70998Z"
        fill={color}
      />
    </svg>
  );
}

export default NavLeft;
