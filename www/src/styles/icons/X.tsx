import theme from 'styles/themes/default';

type Props = {
  'data-test'?: string;
  className?: string;
  color?: string;
  height?: string;
  width?: string;
};

function X({
  color = theme.colors.gray['600'],
  height = '16',
  width = '24',
  ...props
}: Props) {
  const dataTest = props['data-test'] || 'x-svg';
  return (
    <svg
      data-test={dataTest}
      fill="none"
      height={height}
      viewBox="0 0 24 24"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clipRule="evenodd"
        d="M14.2833 10.1624L23.2178 0H21.1006L13.3427 8.82384L7.14656 0H0L9.36984 13.3432L0 24H2.11732L10.3098 14.6817L16.8534 24H24L14.2833 10.1624ZM11.3833 13.4608L10.4339 12.1321L2.88022 1.55962H6.1323L12.2282 10.0919L13.1776 11.4206L21.1016 22.5113H17.8495L11.3833 13.4608Z"
        fill={color}
        fillRule="evenodd"
      />
    </svg>
  );
}

export default X;
