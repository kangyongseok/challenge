import { atom } from 'recoil';
import { keyframes } from '@emotion/react';

export const firstUserAnimationState = atom({
  key: 'firstUserAnimation',
  default: false
});

export const animationKeyframesState = atom({
  key: 'animationKeyframes',
  default: keyframes`
  0% {
    opacity: 0;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`
});
