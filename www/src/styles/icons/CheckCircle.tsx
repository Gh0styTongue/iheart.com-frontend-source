import theme from 'styles/themes/default';

type Props = {
  'data-test'?: string;
  className?: string;
  fill?: string;
};

function CheckCircle({
  'data-test': dataTest,
  fill = theme.colors.white.primary,
  ...props
}: Props) {
  return (
    <svg
      data-test={dataTest}
      fill={fill}
      height="20"
      viewBox="0 0 20 20"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M15.2975 6.29251C14.9072 5.89941 14.2717 5.89829 13.88 6.29L8 12.17L5.11549 9.29352C4.7257 8.90482 4.09474 8.90526 3.70549 9.29451C3.31586 9.68414 3.31586 10.3159 3.70549 10.7055L7.54545 14.5455C7.79649 14.7965 8.20351 14.7965 8.45455 14.5455L15.295 7.705C15.6848 7.31524 15.6859 6.68365 15.2975 6.29251ZM10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.58 18 2 14.42 2 10C2 5.58 5.58 2 10 2C14.42 2 18 5.58 18 10C18 14.42 14.42 18 10 18Z" />
    </svg>
  );
}

export default CheckCircle;
