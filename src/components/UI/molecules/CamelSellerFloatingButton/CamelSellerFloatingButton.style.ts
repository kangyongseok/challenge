/* eslint-disable no-nested-ternary */
import styled from '@emotion/styled';

export const Wrapper = styled.div<{ isLegitTooltip: boolean; isUserShop: boolean }>`
  position: fixed;
  left: 50%;
  bottom: ${({ isLegitTooltip, isUserShop }) => (isUserShop ? 20 : isLegitTooltip ? 110 : 80)}px;
  transform: translateX(-50%);
  z-index: ${({ theme: { zIndex } }) => zIndex.button + 2};
`;

export const FloatingButton = styled.button<{ triggered: boolean; onlyIcon?: boolean }>`
  width: ${({ onlyIcon }) => {
    if (onlyIcon) {
      return 52;
    }
    return 121;
  }}px;
  height: 52px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  opacity: ${({ triggered, onlyIcon }) => {
    if (!triggered && onlyIcon) {
      return 1;
    }
    if (triggered && onlyIcon) {
      return 0;
    }
    if (triggered) {
      return 1;
    }
    return 0;
  }};
  white-space: nowrap;
  transition: ${({ triggered, onlyIcon }) => {
    if (!triggered && onlyIcon) {
      return 'transform 0.3s, scale 0.3s, opacity 0.4s';
    }
    if (triggered && onlyIcon) {
      return 'transform 0.5s, scale 0.5s, opacity 0.3s';
    }
    if (triggered) {
      return 'transform 0.3s, scale 0.3s, opacity 0.4s';
    }
    return 'transform 0.5s, scale 0.5s, opacity 0.3s';
  }};
  transform: ${({ triggered, onlyIcon }) => {
    if (!triggered && onlyIcon) {
      return 'scale(1, 1)';
    }
    if (triggered && onlyIcon) {
      return 'scale(0, 1)';
    }
    if (triggered) {
      return 'scale(1, 1)';
    }
    return 'scale(0, 1)';
  }};
  background: ${({ theme: { palette } }) => palette.primary.main};
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  border-radius: 26px;
`;
