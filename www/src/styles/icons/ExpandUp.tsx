import theme from 'styles/themes/default';

type Props = {
  'data-test'?: string;
  className?: string;
  color?: string;
};

function ExpandUp({ color = theme.colors.gray['500'], ...props }: Props) {
  return (
    <svg fill="none" height="8" viewBox="0 0 12 8" width="12" {...props}>
      <path
        d="M2.11997 6.70998L5.99997 2.82998L9.87997 6.70998C10.27 7.09998 10.9 7.09998 11.29 6.70998C11.68 6.31998 11.68 5.68998 11.29 5.29998L6.69997 0.70998C6.30997 0.31998 5.67997 0.31998 5.28997 0.70998L0.699971 5.29998C0.309971 5.68998 0.309971 6.31998 0.699971 6.70998C1.08997 7.08998 1.72997 7.09998 2.11997 6.70998Z"
        fill={color}
      />
    </svg>
  );
}

export default ExpandUp;
