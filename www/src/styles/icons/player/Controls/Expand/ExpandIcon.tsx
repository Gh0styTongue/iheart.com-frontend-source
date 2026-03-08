import useTheme from 'contexts/Theme/useTheme';

function Expand() {
  const theme = useTheme();

  return (
    <svg
      aria-label="Expand Icon"
      css={{ height: '3.5rem', width: '3.5rem' }}
      fill="none"
      height="35"
      role="img"
      viewBox="0 0 35 35"
      width="35"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.8416 21.4521L17.5 15.7938L23.1583 21.4521C23.7271 22.0208 24.6458 22.0208 25.2146 21.4521C25.7833 20.8833 25.7833 19.9646 25.2146 19.3958L18.5208 12.7021C17.9521 12.1333 17.0333 12.1333 16.4646 12.7021L9.7708 19.3958C9.20205 19.9646 9.20205 20.8833 9.7708 21.4521C10.3396 22.0063 11.2729 22.0208 11.8416 21.4521Z"
        fill={theme.colors.gray[600]}
      />
    </svg>
  );
}

export default Expand;
