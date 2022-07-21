import { HTMLAttributes } from 'react';

import type { CSSValue, CustomStyle } from 'mrcamel-ui';

import { SkeletonInner, SkeletonWrapper, StyledSkeleton } from './Skeleton.styles';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  ratio?: '1:1' | '1:2' | '2:1' | '4:3' | '16:9';
  width?: CSSValue;
  height?: CSSValue;
  maxWidth?: CSSValue | 'fit-content';
  maxHeight?: CSSValue | 'fit-content';
  minWidth?: CSSValue;
  minHeight?: CSSValue;
  disableAspectRatio?: boolean;
  disableAnimation?: boolean;
  customStyle?: CustomStyle;
}
function Skeleton({
  ratio = '1:1',
  width,
  height,
  maxWidth,
  maxHeight,
  minWidth,
  minHeight,
  disableAspectRatio,
  disableAnimation,
  customStyle,
  ...props
}: SkeletonProps) {
  if (disableAspectRatio) {
    return (
      <StyledSkeleton
        customWidth={width}
        customHeight={height}
        maxWidth={maxWidth}
        maxHeight={maxHeight}
        minWidth={minWidth}
        minHeight={minHeight}
        disableAspectRatio={disableAspectRatio}
        disableAnimation={disableAnimation}
        {...props}
        css={customStyle}
      />
    );
  }

  return (
    <SkeletonWrapper ratio={ratio}>
      <SkeletonInner>
        <StyledSkeleton
          disableAspectRatio={disableAspectRatio}
          disableAnimation={disableAnimation}
          {...props}
          css={customStyle}
        />
      </SkeletonInner>
    </SkeletonWrapper>
  );
}

export default Skeleton;
