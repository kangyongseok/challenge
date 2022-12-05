import { Typography, dark } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { APP_TOP_STATUS_HEIGHT } from '@constants/common';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import type { LegitStatusCardHolderProps } from '.';

export const StyledLegitStatusCardHolder = styled.section<
  Pick<LegitStatusCardHolderProps, 'simplify'>
>`
  margin-top: calc(24px + ${isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0}px);
  background-color: ${({ simplify }) =>
    !simplify ? dark.palette.common.bg03 : dark.palette.common.bg02};
  ${({ simplify }): CSSObject =>
    !simplify
      ? {
          boxShadow: '0 16px 40px rgba(133, 133, 133, 0.2)'
        }
      : {}};
  border-radius: ${({ theme: { box } }) => box.round['8']};
`;

export const ResultTitleTypography = styled(Typography)<{ result: 0 | 1 | 2 | 3 }>`
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.cmnW};
  ${({
    theme: {
      palette: { primary, secondary, common }
    },
    result
  }): CSSObject => {
    switch (result) {
      case 1:
        return {
          '& > strong': {
            color: primary.light
          }
        };
      case 2:
        return {
          '& > strong': {
            color: secondary.red.light
          }
        };
      default:
        return {
          '& > strong': {
            color: common.cmnW
          }
        };
    }
  }};
`;

export const BackgroundImage = styled.div<
  Pick<LegitStatusCardHolderProps, 'simplify'> & { src: string }
>`
  position: relative;
  width: 100%;
  height: 335px;

  ${({ simplify, src }): CSSObject =>
    !simplify
      ? {
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundImage: `url(${src})`,
          borderRadius: 16
        }
      : {
          borderTop: `1px dashed ${dark.palette.common.line01}`
        }};

  & *:not(.background-image-blur) {
    z-index: 1;
  }
`;

export const BackgroundImageBlur = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: ${({ theme: { box } }) => box.round['8']};
  background-color: rgba(21, 25, 54, 0.7);
  backdrop-filter: blur(10px);
`;

export const ImageShield = styled.div<{ isActive: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  opacity: 0.5;
  transition: background-color 0.2s ease-in;
  background-color: ${({ isActive }) => (!isActive ? 'black' : 'none')};
`;
