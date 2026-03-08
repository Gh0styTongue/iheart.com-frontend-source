import theme from 'styles/themes/default';

type Props = {
  'data-test'?: string;
  className?: string;
  color?: string;
  height?: number;
  width?: number;
};

function Facebook({
  className = '',
  color = theme.colors.gray['600'],
  height = 24,
  width = 24,
  ...props
}: Props) {
  const dataTest = props['data-test'] || 'facebook-svg';
  return (
    <svg
      className={className}
      data-test={dataTest}
      fill="none"
      height={height}
      viewBox="0 0 24 24"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.677 0H1.32498C0.593977 0 0.000976562 0.593 0.000976562 1.324V22.676C0.000976562 23.408 0.593977 24 1.32498 24H12.819V14.706H9.68998V11.085H12.819V8.41C12.819 5.311 14.713 3.625 17.478 3.625C18.803 3.625 19.942 3.722 20.274 3.766V7.006H18.353C16.853 7.006 16.561 7.727 16.561 8.777V11.088H20.145L19.68 14.718H16.561V24H22.676C23.409 24 24.001 23.408 24.001 22.676V1.324C24.001 0.593 23.409 0 22.677 0Z"
        fill={color}
      />
    </svg>
  );
}

export default Facebook;
