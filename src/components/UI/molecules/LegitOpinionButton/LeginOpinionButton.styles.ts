import styled, { CSSObject } from '@emotion/styled';

import { LegitOpinionButtonProps } from '.';

export const StyledLegitOpinionButton = styled.button<
  Pick<LegitOpinionButtonProps, 'variant' | 'isActive' | 'status'>
>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;

  ${({
    theme: {
      mode,
      palette: { secondary, common }
    },
    variant,
    status,
    isActive
  }): CSSObject => {
    if (!isActive) {
      return {
        backgroundColor: mode === 'dark' || status === 20 ? common.bg02 : common.bg03,
        '& *': {
          color: `${common.ui80} !important`
        }
      };
    }

    switch (variant) {
      case 'impossible':
        return {
          backgroundColor: secondary.purple.highlight,
          '& *': {
            color: `${secondary.purple.light} !important`
          }
        };
      case 'fake':
        return {
          backgroundColor: secondary.red.highlight,
          '& *': {
            color: `${secondary.red.light} !important`
          }
        };
      default:
        return {
          backgroundColor: secondary.blue.highlight,
          '& *': {
            color: `${secondary.blue.light} !important`
          }
        };
    }
  }}

  &:disabled {
    cursor: default;
  }
`;
