import { ComponentPropsWithoutRef, forwardRef } from 'react';

import { Box, Button, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

interface OnboardingBottomCTAProps {
  showBorder?: boolean;
}

const OnboardingBottomCTA = forwardRef<
  HTMLButtonElement,
  OnboardingBottomCTAProps & ComponentPropsWithoutRef<typeof Button>
>(function FixedBottomCTA({ showBorder = false, children, ...props }, forwardedRef) {
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();

  return (
    <Box customStyle={{ position: 'relative', minHeight: 84, width: '100%' }}>
      <ButtonBox showBorder={showBorder}>
        <Button
          ref={forwardedRef}
          fullWidth
          variant="contained"
          brandColor="primary"
          size="large"
          customStyle={{
            color: props.variant === 'outlined' ? primary.main : common.cmnW
          }}
          {...props}
        >
          {children}
        </Button>
      </ButtonBox>
    </Box>
  );
});

const ButtonBox = styled.div<{ showBorder: boolean }>`
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 20px;
  background-color: ${({ theme: { palette } }) => palette.common.cmnW};
  border-top: ${({ theme, showBorder }) =>
    showBorder ? `1px solid ${theme.palette.common.ui90}` : 'none'};
  z-index: ${({ theme }) => theme.zIndex.button};
`;

export default OnboardingBottomCTA;
