import { ComponentPropsWithoutRef, forwardRef } from 'react';

import { Box, Button, dark } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

interface OnboardingBottomCTAProps {
  showBorder?: boolean;
  isResult?: boolean;
}

const OnboardingBottomCTA = forwardRef<
  HTMLButtonElement,
  OnboardingBottomCTAProps & ComponentPropsWithoutRef<typeof Button>
>(function FixedBottomCTA({ isResult, showBorder = false, children, ...props }, forwardedRef) {
  return (
    <Box customStyle={{ position: 'relative', minHeight: 84, width: '100%' }}>
      <ButtonBox showBorder={showBorder} isResult={!!isResult}>
        <Button
          ref={forwardedRef}
          fullWidth
          variant="solid"
          size="xlarge"
          customStyle={{ background: '#2937FF' }}
          {...props}
        >
          {children}
        </Button>
      </ButtonBox>
    </Box>
  );
});

const ButtonBox = styled.div<{ showBorder: boolean; isResult: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20px 20px 40px 20px;
  background: ${({ isResult }) =>
    isResult ? dark.palette.common.uiBlack : dark.palette.common.uiWhite};
  border-top: ${({ theme, showBorder }) =>
    showBorder ? `1px solid ${theme.palette.common.ui90}` : 'none'};
  z-index: ${({ theme }) => theme.zIndex.button};
`;

export default OnboardingBottomCTA;
