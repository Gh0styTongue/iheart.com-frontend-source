import theme from 'styles/themes/default';

type Props = {
  'data-test'?: string;
  className?: string;
  color?: string;
  isFilled?: boolean;
};

function ThumbsDown({
  color = theme.colors.gray['600'],
  isFilled = false,
  ...props
}: Props) {
  return (
    <svg fill="none" height="24" viewBox="0 0 24 24" width="24" {...props}>
      <path
        d="M16.4099 16.4L10.8799 21.94C10.2998 22.53 9.35988 22.53 8.77003 21.95C8.40993 21.59 8.26003 21.08 8.35988 20.58L9.30983 16H3.65993C1.51003 16 0.05983 13.8 0.909928 11.82L4.16994 4.21C4.48 3.48 5.19997 3 6.00002 3H14.99C16.0899 3 16.99 3.9 16.99 5V14.99C16.99 15.52 16.7798 16.03 16.4099 16.4Z"
        fill={isFilled ? color : 'none'}
        stroke={color}
      />
      <path
        d="M19 5C19 3.9 19.8999 3 21 3C22.1001 3 23 3.9 23 5V13C23 14.1 22.1001 15 21 15C19.8999 15 19 14.1 19 13V5Z"
        fill={isFilled ? color : 'none'}
        stroke={color}
      />
    </svg>
  );
}

export default ThumbsDown;
