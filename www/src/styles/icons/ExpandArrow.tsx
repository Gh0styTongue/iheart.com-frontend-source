type Props = {
  'data-test'?: string;
  className?: string;
};

function ExpandArrow({ 'data-test': dataTest, ...props }: Props) {
  return (
    <svg
      data-test={dataTest}
      height="15"
      viewBox="0 0 320 512"
      width="15"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M143 352.3L7 216.3c-9.4-9.4-9.4-24.6 0-33.9l22.6-22.6c9.4-9.4 24.6-9.4 33.9 0l96.4 96.4 96.4-96.4c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9l-136 136c-9.2 9.4-24.4 9.4-33.8 0z" />
    </svg>
  );
}

export default ExpandArrow;
