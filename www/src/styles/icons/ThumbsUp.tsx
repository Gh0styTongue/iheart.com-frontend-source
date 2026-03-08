import theme from 'styles/themes/default';

type Props = {
  'data-test'?: string;
  className?: string;
  color?: string;
  isFilled?: boolean;
};

function ThumbsUp({
  color = theme.colors.gray['600'],
  isFilled = false,
  ...props
}: Props) {
  return (
    <svg fill="none" height="24" viewBox="0 0 24 24" width="24" {...props}>
      <path
        d="M7.58008 7.59997L13.1201 2.05997C13.7 1.46997 14.6399 1.46997 15.23 2.04997C15.5901 2.40996 15.74 2.91997 15.6399 3.41997L14.6899 7.99997H20.3401C22.49 7.99997 23.9399 10.2 23.1001 12.18L19.8401 19.79C19.52 20.52 18.8 21 18 21H9C7.8999 21 7 20.1 7 19V9.00997C7 8.47996 7.20996 7.96997 7.58008 7.59997Z"
        fill={isFilled ? color : 'none'}
        stroke={color}
      />
      <path
        d="M5 19C5 20.1 4.1001 21 3 21C1.8999 21 1 20.1 1 19V11C1 9.89997 1.8999 8.99997 3 8.99997C4.1001 8.99997 5 9.89997 5 11V19Z"
        fill={isFilled ? color : 'none'}
        stroke={color}
      />
    </svg>
  );
}

export default ThumbsUp;
