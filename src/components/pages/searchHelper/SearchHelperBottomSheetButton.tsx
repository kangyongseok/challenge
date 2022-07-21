import { ComponentPropsWithoutRef, forwardRef } from 'react';

import { CtaButton, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

const SearchHelperBottomSheetButton = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof CtaButton>
>(function FixedBottomCTA({ children, ...props }, forwardedRef) {
  const {
    theme: { palette }
  } = useTheme();

  return (
    <ButtonBox>
      <CtaButton
        ref={forwardedRef}
        fullWidth
        variant="contained"
        brandColor="primary"
        size="large"
        customStyle={{
          color: props.variant === 'outlined' ? palette.primary.main : palette.common.white
        }}
        {...props}
      >
        {children}
      </CtaButton>
    </ButtonBox>
  );
});

const ButtonBox = styled.div`
  width: 100%;
  padding: 20px;
  background-color: ${({ theme: { palette } }) => palette.common.white};
  border-top: ${({ theme }) => `1px solid ${theme.palette.common.grey['90']}`};
  z-index: 1;
`;

export default SearchHelperBottomSheetButton;
