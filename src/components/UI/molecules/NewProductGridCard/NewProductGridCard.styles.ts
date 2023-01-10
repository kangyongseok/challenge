import styled from '@emotion/styled';

import { NewProductGridCardProps } from '.';

export const WishButtonA = styled.button<Pick<NewProductGridCardProps, 'variant'>>`
  position: absolute;
  right: ${({ variant }) => (variant === 'gridA' ? 8 : 4)}px;
  bottom: -18px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  z-index: 3;
`;

export const WishButtonB = styled.button<Pick<NewProductGridCardProps, 'variant'>>`
  position: absolute;
  top: -2px;
  right: ${({ variant }) => (variant === 'gridA' ? 4 : -4)}px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  z-index: 3;
`;

export const Content = styled.div<Pick<NewProductGridCardProps, 'variant'>>`
  position: relative;
  padding: ${({ variant }) => {
    if (variant === 'gridC' || variant === 'swipeX') {
      return '12px 0';
    }
    if (variant === 'gridB') {
      return '12px 4px';
    }
    return '12px';
  }};
`;

export const Overlay = styled.div<Pick<NewProductGridCardProps, 'isRound'>>`
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: ${({ isRound }) => (isRound ? 8 : 0)}px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.overlay40};
  z-index: 2;
`;
