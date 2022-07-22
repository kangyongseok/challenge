import { Flexbox } from 'mrcamel-ui';
import styled from '@emotion/styled';

export const Wrapper = styled(Flexbox)`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: ${({ theme: { zIndex } }) => zIndex.dialog};
`;

export const Box = styled.div`
  position: relative;
  height: 75px;
  width: 75px;
`;

const BaseRound = styled.span`
  position: absolute;
  height: 75px;
  width: 75px;
  border: thick solid ${({ theme }) => theme.palette.primary.main};
  border-radius: 50%;
  opacity: 1;
  top: 0;
  left: 0;
  animation-duration: 2s;
  animation-name: puff1, puff2;
  animation-iteration-count: infinite;
  animation-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1), cubic-bezier(0.3, 0.61, 0.355, 1);

  @keyframes puff1 {
    0% {
      transform: scale(0);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes puff2 {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
`;

export const FistRound = styled(BaseRound)`
  animation-delay: -1s;
`;

export const SecondRound = styled(BaseRound)`
  animation-delay: 0s;
`;
