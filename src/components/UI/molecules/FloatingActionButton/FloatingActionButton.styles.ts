import styled from '@emotion/styled';

import type { FloatingActionButtonProps } from '.';

export const Wrapper = styled.div<Pick<FloatingActionButtonProps, 'bottom'>>`
  position: fixed;
  left: 50%;
  bottom: ${({ bottom = 80 }) => bottom}px;
  transform: translateX(-50%);
  z-index: ${({ theme: { zIndex } }) => zIndex.button + 2};
`;
export const StyledFloatingActionButton = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 14px;
  border-radius: 26px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiBlack};
  overflow: hidden;
`;

export const StyledDialMenu = styled.div<Pick<FloatingActionButtonProps, 'bottom'>>`
  position: fixed;
  left: 50%;
  bottom: ${({ bottom = 80 }) => bottom + 64}px;
  transform: translate(-50%, 20%);
  z-index: ${({ theme: { zIndex } }) => zIndex.button + 1};
  animation: slideUpDial 0.2s forwards;

  @keyframes slideUpDial {
    0% {
      transform: translate(-50%, 20%);
    }
    100% {
      transform: translate(-50%, 0);
    }
  }
`;
