import theme from 'styles/themes/default';

type Props = {
  'data-test'?: string;
  className?: string;
  fill?: string;
};

function ChevronArrow({
  'data-test': dataTest,
  fill = theme.colors.black.primary,
  ...props
}: Props) {
  return (
    <svg
      data-test={dataTest}
      fill={fill}
      height="18"
      viewBox="0 0 7 12"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M0.310078 0.710022C-0.0799219 1.10002 -0.0799219 1.73002 0.310078 2.12002L4.19008 6.00002L0.310078 9.88002C-0.0799219 10.27 -0.0799219 10.9 0.310078 11.29C0.700078 11.68 1.33008 11.68 1.72008 11.29L6.31008 6.70002C6.70008 6.31002 6.70008 5.68002 6.31008 5.29002L1.72008 0.700022C1.34008 0.320022 0.700078 0.320022 0.310078 0.710022Z" />
    </svg>
  );
}

export default ChevronArrow;
