type Props = {
  'data-test'?: string;
};

function Play(props: Props) {
  return (
    <svg {...props} viewBox="0 0 29 32">
      <path d="M5.281 1.144l22.375 14.094q0.438 0.25 0.438 0.75t-0.438 0.781l-22.375 14.063q-0.469 0.313-0.922 0.047t-0.453-0.797v-28.125q0-0.563 0.469-0.828t0.906 0.016v0z" />
    </svg>
  );
}

export default Play;
