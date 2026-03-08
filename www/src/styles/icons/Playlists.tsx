type Props = {
  'data-test'?: string;
  className?: string;
  gradientStop1?: string;
  gradientStop2?: string;
  height?: string | number;
  width?: string | number;
};

function Playlists({ height = 24, width = 24, ...props }: Props) {
  const { 'data-test': dataTest, className } = props;

  return (
    <svg
      className={className}
      data-name="Layer 1"
      data-test={dataTest}
      fill="none"
      height={height}
      id="Layer_1"
      viewBox="0 0 16 24"
      width={width}
    >
      <path
        d="M12,2.67v11.4a5.26,5.26,0,0,0-4.44-.43A5.33,5.33,0,0,0,10.2,23.93a5.47,5.47,0,0,0,4.47-5.46V5.33h2.66a2.67,2.67,0,1,0,0-5.33H14.67A2.68,2.68,0,0,0,12,2.67Z"
        transform="translate(-4)"
      />
    </svg>
  );
}

export default Playlists;
