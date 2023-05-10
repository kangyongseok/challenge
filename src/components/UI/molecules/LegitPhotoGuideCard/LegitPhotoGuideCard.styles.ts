import { Image } from '@mrcamelhub/camel-ui';
import styled, { CSSObject } from '@emotion/styled';

import type { CommonPhotoGuideDetail } from '@dto/common';

import type { LegitPhotoGuideCardProps } from '.';

export const StyledLegitPhotoGuideCard = styled.div<
  Pick<CommonPhotoGuideDetail, 'imageSample'> &
    Pick<
      LegitPhotoGuideCardProps,
      'isInvalid' | 'hideStatusHighLite' | 'hideHighLite' | 'highLiteColor' | 'imageUrl'
    > & {
      status?: 0 | 1 | 2 | 3;
      isLoading: boolean;
    }
>`
  position: relative;
  width: 100%;
  padding-top: 100%;
  border: 2px solid transparent;
  border-radius: ${({ theme: { box } }) => box.round['8']};
  overflow: hidden;
  ${({ imageSample, imageUrl, isLoading }): CSSObject => ({
    background:
      isLoading && !imageUrl
        ? ''
        : `linear-gradient(0deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${
            imageUrl || imageSample
          }), no-repeat, center`,
    backgroundSize: 'cover'
  })};
  background-color: ${({
    theme: {
      palette: { common }
    },
    isLoading
  }) => (isLoading ? common.ui90 : common.bg03)};
  background-position: center;

  ${({
    theme: {
      palette: { primary, secondary }
    },
    status,
    hideStatusHighLite,
    isInvalid
  }): CSSObject => {
    let cssObject: CSSObject = {};

    if (hideStatusHighLite) return cssObject;

    if (status === 1 && isInvalid) {
      cssObject = {
        borderColor: secondary.red.main
      };
    } else if (status === 2) {
      cssObject = {
        borderColor: secondary.red.main
      };
    } else if (status === 3) {
      cssObject = {
        borderColor: primary.main
      };
    }
    return cssObject;
  }};

  ${({
    theme: {
      palette: { primary, secondary }
    },
    hideHighLite,
    highLiteColor
  }) => {
    let cssObject: CSSObject = {};

    if (hideHighLite) return cssObject;

    if (highLiteColor === 'red-light') {
      cssObject = {
        borderWidth: 2,
        borderColor: secondary.red.light
      };
    } else if (highLiteColor === 'primary-light') {
      cssObject = {
        borderWidth: 2,
        borderColor: primary.light
      };
    }

    return cssObject;
  }};
`;

export const PhotoGuideInfo = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 2px;
  gap: 4px;
`;

export const WaterMark = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export const AnimationLoading = styled(Image)`
  animation: rotate 1s linear infinite;
  width: 30px;

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
