import styled from '@emotion/styled';

import { LegitGridCardProps } from '.';

export const Content = styled.div<Pick<LegitGridCardProps, 'variant'>>`
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

export const Overlay = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 24px;
  border-radius: 0 0 4px 4px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.overlay40};
`;

export const MoreButton = styled.button<Pick<LegitGridCardProps, 'variant'>>`
  position: absolute;
  top: 6px;
  right: ${({ variant }) => (variant === 'gridA' ? 12 : 4)}px;
`;
