import { ComponentPropsWithoutRef, forwardRef } from 'react';

import { Button, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

const SearchHelperBottomSheetButton = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof Button>
>(function FixedBottomCTA({ children, ...props }, forwardedRef) {
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();

  return (
    <ButtonBox>
      <Button
        ref={forwardedRef}
        fullWidth
        variant="solid"
        brandColor="primary"
        size="large"
        customStyle={{
          color: props.variant === 'outline' ? primary.main : common.cmnW
        }}
        {...props}
      >
        {children}
      </Button>
    </ButtonBox>
  );
});

const ButtonBox = styled.div`
  width: 100%;
  padding: 20px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  border-top: ${({
    theme: {
      palette: { common }
    }
  }) => `1px solid ${common.ui90}`};
  z-index: 1;
`;

export default SearchHelperBottomSheetButton;
