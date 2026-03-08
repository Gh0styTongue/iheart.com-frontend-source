import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { listenInBackground } from 'constants/assets';

type Props = { bounceAnimation: boolean };

const bounce = keyframes`
  from,
  20%,
  53%,
  80%,
  to {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translate3d(0, 0, 0);
  }
  40%,
  43% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -30px, 0);
  }
  70% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
`;

const ListenInWrapper = styled('div')<Props>(({ bounceAnimation }) => ({
  animation: bounceAnimation ? `${bounce} 1.2s infinite ease-out` : 'none',
  backgroundImage: `url("${listenInBackground}")`,
  backgroundPosition: 'center center',
  backgroundSize: 'cover',
  height: '100%',
  position: 'relative',
  width: '100%',
}));

export default ListenInWrapper;
