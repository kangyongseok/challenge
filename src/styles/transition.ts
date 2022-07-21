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
}`;
