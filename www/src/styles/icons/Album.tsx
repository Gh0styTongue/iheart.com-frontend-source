import theme from 'styles/themes/default';

type Props = {
  'data-test'?: string;
  className?: string;
  color?: string;
};

function Album({ color = theme.colors.gray['500'], ...props }: Props) {
  return (
    <svg fill="none" height="20" viewBox="0 0 20 20" width="20" {...props}>
      <path
        d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 14.5C7.51 14.5 5.5 12.49 5.5 10C5.5 7.51 7.51 5.5 10 5.5C12.49 5.5 14.5 7.51 14.5 10C14.5 12.49 12.49 14.5 10 14.5ZM10 9C9.45 9 9 9.45 9 10C9 10.55 9.45 11 10 11C10.55 11 11 10.55 11 10C11 9.45 10.55 9 10 9Z"
        fill={color}
      />
    </svg>
  );
}

export default Album;
