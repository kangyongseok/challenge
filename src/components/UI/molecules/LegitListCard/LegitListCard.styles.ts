import { Typography } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { LegitListCardProps } from '.';

export const Description = styled(Typography)`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
`;

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
