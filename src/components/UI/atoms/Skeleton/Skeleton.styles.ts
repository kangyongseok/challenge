import type { CSSValue } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { pulse } from '@styles/transition';

import { SkeletonProps } from '.';

export const SkeletonWrapper = styled.div<Pick<SkeletonProps, 'ratio'>>`
  position: relative;
  overflow: hidden;

  ${({ ratio }): CSSObject => {
    let cssObject;
    switch (ratio) {
      case '1:2':
        cssObject = {
          paddingTop: '200%'
        };
        break;
      case '2:1':
        cssObject = {
          paddingTop: '50%'
        };
        break;
      case '4:3':
        cssObject = {
          paddingTop: '75%'
        };
        break;
      case '16:9':
        cssObject = {
          paddingTop: '56.25%'
        };
        break;
      default:
        cssObject = {
          paddingTop: '100%'
        };
        break;
    }
    return cssObject;
  }}
`;

export const SkeletonInner = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transform: translate(50%, 50%);
`;

export const StyledSkeleton = styled.div<
  Pick<
    SkeletonProps,
    | 'maxWidth'
    | 'maxHeight'
    | 'minWidth'
    | 'minHeight'
    | 'disableAspectRatio'
    | 'disableAnimation'
    | 'isRound'
  > & {
    customWidth?: CSSValue;
    customHeight?: CSSValue;
  }
>`
  ${({ customWidth }) => (customWidth ? `width: ${customWidth}` : '')};
  ${({ customHeight }) => (customHeight ? `height: ${customHeight}` : '')};
  ${({ maxWidth }) => (maxWidth ? `max-width: ${maxWidth}` : '')};
  ${({ maxHeight }) => (maxHeight ? `max-height: ${maxHeight}` : '')};
  ${({ minWidth }) => (minWidth ? `min-width: ${minWidth}` : '')};
  ${({ minHeight }) => (minHeight ? `min-height: ${minHeight}` : '')};
  ${({ isRound }) => (isRound ? 'border-radius: 8px' : '')};

  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui90};

  ${({ disableAspectRatio }): CSSObject =>
    !disableAspectRatio
      ? {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          transform: 'translate(-50%, -50%)'
        }
      : {}};
  ${({ disableAnimation }): CSSObject =>
    !disableAnimation
      ? {
          animation: `${pulse} 800ms linear 0s infinite alternate`
        }
      : {}};
`;
