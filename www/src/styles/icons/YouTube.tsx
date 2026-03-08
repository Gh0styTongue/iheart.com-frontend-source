import theme from 'styles/themes/default';

type Props = {
  'data-test'?: string;
  className?: string;
  color?: string;
  height?: string;
  width?: string;
};

function YouTube({
  color = theme.colors.gray['600'],
  height = '16',
  width = '24',
  ...props
}: Props) {
  const dataTest = props['data-test'] || 'youtube-svg';
  return (
    <svg
      data-test={dataTest}
      fill="none"
      height={height}
      viewBox="0 0 24 16"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clipRule="evenodd"
        d="M20.9991 0.489412C21.9843 0.752941 22.761 1.52471 23.0263 2.50353C23.5188 4.29176 23.4999 8.01882 23.4999 8.01882C23.4999 8.01882 23.4999 11.7271 23.0263 13.5153C22.761 14.4941 21.9843 15.2659 20.9991 15.5294C19.1993 16 12 16 12 16C12 16 4.81959 16 3.00081 15.5106C2.01564 15.2471 1.23888 14.4753 0.973639 13.4965C0.5 11.7271 0.5 8 0.5 8C0.5 8 0.5 4.29176 0.973639 2.50353C1.23888 1.52471 2.03459 0.734118 3.00081 0.470588C4.80064 0 12 0 12 0C12 0 19.1993 0 20.9991 0.489412ZM15.6944 8L9.70756 11.4259V4.57412L15.6944 8Z"
        fill={color}
        fillRule="evenodd"
      />
    </svg>
  );
}

export default YouTube;
