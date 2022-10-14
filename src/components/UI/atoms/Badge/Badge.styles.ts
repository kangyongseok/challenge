import type { CSSValue } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { convertNumberToCSSValue } from '@utils/formats';

import { BadgeProps } from '.';

export const StyledBadge = styled.div<
  Pick<BadgeProps, 'variant' | 'type' | 'brandColor'> & {
    dataWidth: CSSValue | 'auto';
    dataHeight: CSSValue | 'auto';
  }
>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ dataWidth }) => convertNumberToCSSValue(dataWidth)};
  height: ${({ dataHeight }) => convertNumberToCSSValue(dataHeight)};
  padding: 1px;
  border-radius: 10px;

  ${({
    theme: {
      palette: { common }
    },
    variant
  }): CSSObject => {
    switch (variant) {
      case 'two-tone':
        return {
          border: `2px solid ${common.cmnW}`
        };
      default:
        return {};
    }
  }};

  ${({ type }): CSSObject => {
    switch (type) {
      case 'wrapper':
        return {
          position: 'absolute',
          top: 0,
          right: 0
        };
      default:
        return {};
    }
  }};

  ${({
    theme: {
      palette: { primary, secondary }
    },
    brandColor
  }): CSSObject => {
    switch (brandColor) {
      case 'red':
        return {
          backgroundColor: secondary.red.main
        };
      default:
        return {
          backgroundColor: primary.main
        };
    }
  }};

  ${({
    theme: {
      typography: { small2 },
      palette: { common }
    }
  }): CSSObject => ({
    fontSize: small2.size,
    fontWeight: small2.weight.bold,
    lineHeight: small2.lineHeight,
    letterSpacing: small2.letterSpacing,
    color: common.cmnW
  })};
`;
