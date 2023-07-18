import { keyframes } from '@emotion/react';

export const pulse = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0.2;
  }
`;

export const fadeIn = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

export const fadeOut = keyframes`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    pointer-events: none;
  }
`;

export const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

export const shake = keyframes`
  0% {
    transform: translateX(0px);
    animation-timing-function: ease-in;
  }
  37% {
    transform: translateX(5px);
    animation-timing-function: ease-out;
  }
  55% {
    transform: translateX(-5px);
    animation-timing-function: ease-in;
  }
  73% {
    transform: translateX(4px);
    animation-timing-function: ease-out;
  }
  82% {
    transform: translateX(-4px);
    animation-timing-function: ease-in;
  }
  91% {
    transform: translateX(2px);
    animation-timing-function: ease-out;
  }
  96% {
    transform: translateX(-2px);
    animation-timing-function: ease-in;
  }
  100% {
    transform: translateX(0px);
    animation-timing-function: ease-in;
  }
`;

export const circlePulse = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(0.33);
  }
  80%,
  100% {
    opacity: 0;
  }
`;
