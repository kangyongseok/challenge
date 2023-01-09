import styled, { CSSObject } from '@emotion/styled';

import { LegitListCardProps } from '.';

export const MoreButton = styled.button<Pick<LegitListCardProps, 'variant'>>`
  position: absolute;
  top: ${({ variant }) => (variant === 'listB' ? '50%' : 0)};
  right: 0;

  ${({ variant }): CSSObject =>
    variant === 'listB'
      ? {
          transform: 'translateY(-50%)'
        }
      : {}}
`;
