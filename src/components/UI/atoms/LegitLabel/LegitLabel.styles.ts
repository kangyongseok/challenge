import { Typography, light } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { LegitLabelProps } from '.';

export const StyledLegitLabel = styled.label<Pick<LegitLabelProps, 'variant'>>`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px 6px;
  min-width: fit-content;
  height: fit-content;
  border-radius: ${({ theme: { box } }) => box.round['4']};

  ${({ variant }): CSSObject => {
    switch (variant) {
      case 'fake':
        return {
          backgroundColor: light.palette.secondary.red.dark
        };
      case 'impossible':
        return {
          backgroundColor: light.palette.common.ui20
        };
      default:
        return {
          backgroundColor: light.palette.primary.dark
        };
    }
  }}

  & > svg {
    color: ${({
      theme: {
        palette: { common }
      }
    }) => common.cmnW};
  }
`;

export const Text = styled(Typography)`
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.cmnW};
`;
