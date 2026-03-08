import theme from 'styles/themes/default';

type Props = {
  'data-test'?: string;
  fill?: string;
  className?: string;
};

function Follow({ fill = theme.colors.white.primary, ...props }: Props) {
  return (
    <svg
      fill="none"
      height="10"
      viewBox="0 0 10 10"
      width="10"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M8.99998 5.66671H5.66665V9.00004C5.66665 9.36671 5.36665 9.66671 4.99998 9.66671C4.63331 9.66671 4.33331 9.36671 4.33331 9.00004V5.66671H0.99998C0.633313 5.66671 0.333313 5.36671 0.333313 5.00004C0.333313 4.63337 0.633313 4.33337 0.99998 4.33337H4.33331V1.00004C4.33331 0.633374 4.63331 0.333374 4.99998 0.333374C5.36665 0.333374 5.66665 0.633374 5.66665 1.00004V4.33337H8.99998C9.36665 4.33337 9.66665 4.63337 9.66665 5.00004C9.66665 5.36671 9.36665 5.66671 8.99998 5.66671Z"
        fill={fill}
      />
    </svg>
  );
}

export default Follow;
