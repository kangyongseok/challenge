import { InputHTMLAttributes, ReactElement, forwardRef } from 'react';

import { useRecoilValue } from 'recoil';
import type { CustomStyle } from 'mrcamel-ui';

import { showAppDownloadBannerState } from '@recoil/common';

import { Input, StyledSearchBar, Wrapper } from './SearchBar.styles';

export interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'outlined' | 'standard';
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  fullWidth?: boolean;
  customStyle?: CustomStyle;
  isFixed?: boolean;
  isBottomBorderFixed?: boolean;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar(
  {
    variant,
    startIcon,
    endIcon,
    fullWidth = false,
    customStyle,
    isFixed = false,
    isBottomBorderFixed = false,
    ...props
  },
  ref
) {
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  return (
    <StyledSearchBar
      ref={ref}
      isFixed={isFixed}
      showAppDownloadBanner={showAppDownloadBanner}
      css={customStyle}
    >
      <Wrapper
        variant={variant}
        fullWidth={fullWidth}
        isBottomBorderFixed={isBottomBorderFixed}
        showAppDownloadBanner={showAppDownloadBanner}
      >
        {startIcon}
        <Input {...props} />
        {endIcon}
      </Wrapper>
    </StyledSearchBar>
  );
});

export default SearchBar;
