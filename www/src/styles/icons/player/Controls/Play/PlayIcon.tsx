import Icon from './primitives/Icon';

function Play({ fill, size }: { fill?: string; size?: string }) {
  return (
    <Icon
      aria-label="Play Icon"
      data-test="play-icon"
      fill="none"
      height="24"
      role="img"
      size={size}
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 0C5.376 0 0 5.376 0 12C0 18.624 5.376 24 12 24C18.624 24 24 18.624 24 12C24 5.376 18.624 0 12 0ZM9.6 16.2V7.8C9.6 7.308 10.164 7.02 10.56 7.32L16.164 11.52C16.488 11.76 16.488 12.24 16.164 12.48L10.56 16.68C10.164 16.98 9.6 16.692 9.6 16.2Z"
        fill={fill}
      />
    </Icon>
  );
}

export default Play;
