import styled from '@emotion/styled';

import { LegitGridCardSkeletonProps } from '.';

export const Content = styled.div<Pick<LegitGridCardSkeletonProps, 'variant'>>`
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