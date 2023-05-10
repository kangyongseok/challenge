import { forwardRef } from 'react';

import { CSSValue, CustomStyle } from '@mrcamelhub/camel-ui';

import { StyledGap } from './Gap.styles';

export interface GapProps {
  height: CSSValue;
  customStyle?: CustomStyle;
}

const Gap = forwardRef<HTMLDivElement, GapProps>(function Gap(
  { height, customStyle },
  forwardedRef
) {
  return <StyledGap ref={forwardedRef} height={height} css={customStyle} />;
});

export default Gap;
