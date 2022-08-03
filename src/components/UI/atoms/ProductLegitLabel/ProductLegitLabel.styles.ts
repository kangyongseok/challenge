import { Typography } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { ProductLegitLabelProps } from '.';

export const StyledProductLegitLabel = styled.label<Pick<ProductLegitLabelProps, 'variant'>>`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px 6px;
  min-width: fit-content;
  height: fit-content;
  border-radius: ${({ theme: { box } }) => box.round['4']};

  ${({
    theme: {
      palette: { primary, secondary, common }
    },
    variant
  }): CSSObject => {
    switch (variant) {
      case 'fake':
        return {
          backgroundColor: secondary.red.dark
        };
      case 'impossible':
        return {
          backgroundColor: common.grey['20']
        };
      default:
        return {
          backgroundColor: primary.dark
        };
    }
  }}

  & > svg {
    color: ${({
      theme: {
        palette: { common }
      }
    }) => common.white};
  }
`;

export const Text = styled(Typography)`
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.white};
`;
