import Icon from './primitives/Icon';

function Pause({ fill, size }: { fill?: string; size?: string }) {
  return (
    <Icon
      aria-label="Pause Icon"
      data-test="pause-icon"
      fill="none"
      height="24"
      role="img"
      size={size}
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 0C5.376 0 0 5.376 0 12C0 18.624 5.376 24 12 24C18.624 24 24 18.624 24 12C24 5.376 18.624 0 12 0ZM9.6 16.8C8.94 16.8 8.4 16.26 8.4 15.6V8.4C8.4 7.74 8.94 7.2 9.6 7.2C10.26 7.2 10.8 7.74 10.8 8.4V15.6C10.8 16.26 10.26 16.8 9.6 16.8ZM14.4 16.8C13.74 16.8 13.2 16.26 13.2 15.6V8.4C13.2 7.74 13.74 7.2 14.4 7.2C15.06 7.2 15.6 7.74 15.6 8.4V15.6C15.6 16.26 15.06 16.8 14.4 16.8Z"
        fill={fill}
      />
    </Icon>
  );
}

export default Pause;
