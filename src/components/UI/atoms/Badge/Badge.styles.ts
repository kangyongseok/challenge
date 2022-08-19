import type { CSSValue } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { convertNumberToCSSValue } from '@utils/formats';

import { BadgeProps } from '.';

export const StyledBadge = styled.div<
  Pick<BadgeProps, 'brandColor'> & {
    dataWidth: CSSValue;
    dataHeight: CSSValue;
  }
>`
  position: absolute;
  top: 0;
  right: 0;
  width: ${({ dataWidth }) => convertNumberToCSSValue(dataWidth)};
  height: ${({ dataHeight }) => convertNumberToCSSValue(dataHeight)};
  border-radius: 50%;

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
  }}
`;
