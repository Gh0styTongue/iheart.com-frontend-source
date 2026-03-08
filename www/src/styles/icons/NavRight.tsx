import theme from 'styles/themes/default';

type Props = {
  'data-test'?: string;
  className?: string;
  color?: string;
};

function NavRight({ color = theme.colors.gray['500'], ...props }: Props) {
  return (
    <svg fill="none" height="24" viewBox="0 0 24 24" width="24" {...props}>
      <path
        d="M9.31008 6.71002C8.92008 7.10002 8.92008 7.73002 9.31008 8.12002L13.1901 12L9.31008 15.88C8.92008 16.27 8.92008 16.9 9.31008 17.29C9.70008 17.68 10.3301 17.68 10.7201 17.29L15.3101 12.7C15.7001 12.31 15.7001 11.68 15.3101 11.29L10.7201 6.70002C10.3401 6.32002 9.70008 6.32002 9.31008 6.71002Z"
        fill={color}
      />
    </svg>
  );
}

export default NavRight;
