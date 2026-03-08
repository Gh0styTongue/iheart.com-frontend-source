import usePlayerColor from 'contexts/PlayerColor/usePlayerColor';

type Props = {
  filled?: boolean;
};

function DownIcon({ filled = false }: Props) {
  const { playerColor } = usePlayerColor();
  return (
    <svg
      aria-label={`Thumb Down Icon${filled ? ' Filled' : ''}`}
      css={{ height: '2.4rem', width: '2.4rem' }}
      fill="none"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {filled ?
        <path
          clipRule="evenodd"
          d="M8.69679 19.58L9.64674 15H3.99684C1.84694 15 0.396745 12.8 1.24684 10.82L4.50685 3.21C4.81691 2.48 5.53688 2 6.33693 2H15.3269C16.4268 2 17.3269 2.9 17.3269 4V13.99C17.3269 14.52 17.1167 15.03 16.7468 15.4L11.2168 20.94C10.6367 21.53 9.69679 21.53 9.10695 20.95C8.74684 20.59 8.59694 20.08 8.69679 19.58Z"
          fill={playerColor}
          fillRule="evenodd"
        />
      : <path
          clipRule="evenodd"
          d="M8.69679 19.58L9.64674 15H3.99684C1.84694 15 0.396744 12.8 1.24684 10.82L4.50685 3.21C4.81691 2.48 5.53688 2 6.33693 2H15.3269C16.4268 2 17.3269 2.9 17.3269 4V13.99C17.3269 14.52 17.1167 15.03 16.7468 15.4L11.2168 20.94C10.6367 21.53 9.69679 21.53 9.10695 20.95C8.74684 20.59 8.59694 20.08 8.69679 19.58ZM10.9993 18.327L12.1041 13H3.99684C3.28533 13 2.80041 12.271 3.08462 11.609L6.34421 4H15.3269V13.99C15.3269 13.9904 15.3269 13.991 15.3267 13.9917L10.9993 18.327Z"
          fill={playerColor}
          fillRule="evenodd"
        />
      }
      <path
        d="M23 4C23 2.89543 22.1046 2 21 2C19.8954 2 19 2.89543 19 4V12C19 13.1046 19.8954 14 21 14C22.1046 14 23 13.1046 23 12V4Z"
        fill={playerColor}
      />
    </svg>
  );
}

export default DownIcon;
