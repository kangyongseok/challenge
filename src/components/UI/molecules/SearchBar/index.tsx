import { InputHTMLAttributes, ReactElement, forwardRef } from 'react';

import { useRecoilValue } from 'recoil';
import type { CustomStyle } from 'mrcamel-ui';
import { Box } from 'mrcamel-ui';

import { showAppDownloadBannerState } from '@recoil/common';

import { EndIcon, Input, InputBox, StartIcon, StyledSearchBar, Wrapper } from './SearchBar.styles';

export interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'outlined' | 'standard' | 'innerOutlined';
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  startAdornment?: ReactElement;
  endAdornment?: ReactElement;
  fullWidth?: boolean;
  isFixed?: boolean;
  customStyle?: CustomStyle;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar(
  {
    variant = 'outlined',
    startIcon,
    endIcon,
    startAdornment,
    endAdornment,
    fullWidth = false,
    isFixed = false,
    customStyle,
    ...props
  },
  ref
) {
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  return (
    <>
      <StyledSearchBar
        ref={ref}
        isFixed={isFixed}
        variant={variant}
        showAppDownloadBanner={showAppDownloadBanner}
        css={customStyle}
      >
        {startIcon && <StartIcon>{startIcon}</StartIcon>}
        <InputBox
          variant={variant}
          fullWidth={fullWidth}
          hasStartIcon={!!startIcon}
          hasEndIcon={!!endIcon}
        >
          <Wrapper
            variant={variant}
            fullWidth={fullWidth}
            showAppDownloadBanner={showAppDownloadBanner}
          >
            {startAdornment}
            <Input {...props} />
            {endAdornment}
          </Wrapper>
        </InputBox>
        {endIcon && <EndIcon>{endIcon}</EndIcon>}
      </StyledSearchBar>
      {isFixed && <Box customStyle={{ height: 44, visibility: 'hidden' }} />}
    </>
  );
});

export default SearchBar;
