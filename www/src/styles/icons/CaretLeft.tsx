import theme from 'styles/themes/default';

type Props = {
  'data-test'?: string;
  className?: string;
};

function CaretLeft(props: Props) {
  return (
    <svg {...props} fill="none" height="16" width="9">
      <path
        d="M7.8 0L0 8l7.8 8 1-.9-7-7.1 7-7.1-1-.9z"
        fill={theme.colors.black.dark}
      />
    </svg>
  );
}

export default CaretLeft;
