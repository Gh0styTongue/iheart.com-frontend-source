import { keyframes as makeKeyframeClass } from '@emotion/react';

type attributes = Readonly<{
  [type: string]: string;
}>;

const keyframes: Readonly<attributes> = {
  fadeIn: makeKeyframeClass({
    opacity: 0,
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  }),
  fadeOut: makeKeyframeClass({
    opacity: 1,
    from: {
      opacity: 1,
    },
    to: {
      opacity: 0,
    },
  }),
  fillUp: makeKeyframeClass({
    transform: 'translateY(100%)',
    from: {
      transform: 'translateY(100%)',
    },
    to: {
      transform: 'translateY(0)',
    },
  }),
  minimizeSize: makeKeyframeClass({
    height: '100%',
    width: '100%',
    from: {
      height: '100%',
      width: '100%',
    },
    to: {
      height: 0,
      width: 0,
    },
  }),
  translateUp: makeKeyframeClass({
    from: {
      transform: 'translate3d(0, 3rem, 0)',
    },
    to: {
      transform: 'translateZ(0)',
    },
  }),
};

export default keyframes;
