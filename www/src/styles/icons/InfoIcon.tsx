import theme from 'styles/themes/default';

interface Props {
  'data-test'?: string;
  className?: string;
}

export default function InfoIcon(props: Props) {
  return (
    <svg
      {...props}
      fill="none"
      height="20"
      stroke={theme.colors.white.primary}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="16" y2="12" />
      <line x1="12" x2="12.01" y1="8" y2="8" />
    </svg>
  );
}
