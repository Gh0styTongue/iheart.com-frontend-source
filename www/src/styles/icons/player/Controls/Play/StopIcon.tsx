import Icon from './primitives/Icon';

function Stop({ fill, size }: { fill?: string; size?: string }) {
  return (
    <Icon
      aria-label="Stop Icon"
      fill="none"
      height="24"
      role="img"
      size={size}
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clipRule="evenodd"
        d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM15.6 9.6C15.6 8.94 15.06 8.4 14.4 8.4H9.6C8.94 8.4 8.4 8.94 8.4 9.6V14.4C8.4 15.06 8.94 15.6 9.6 15.6H14.4C15.06 15.6 15.6 15.06 15.6 14.4V9.6Z"
        fill={fill}
        fillRule="evenodd"
      />
    </Icon>
  );
}

export default Stop;
