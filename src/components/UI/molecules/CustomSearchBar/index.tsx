import { InputHTMLAttributes, ReactElement, forwardRef } from 'react';

import { useRecoilValue } from 'recoil';
import type { CustomStyle } from '@mrcamelhub/camel-ui';

import { showAppDownloadBannerState } from '@recoil/common';

import { Input, StyledSearchBar, Wrapper } from './SearchBar.styles';

export interface CustomSearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'outlined' | 'standard';
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  fullWidth?: boolean;
  brandColor?: 'primary' | 'black';
  isFixed?: boolean;
  isBottomBorderFixed?: boolean;
  isBorder?: boolean;
  customStyle?: CustomStyle;
}

const CustomSearchBar = forwardRef<HTMLInputElement, CustomSearchBarProps>(function SearchBar(
  {
    variant,
    startIcon,
    endIcon,
    fullWidth = false,
    brandColor = 'primary',
    isFixed = false,
    isBottomBorderFixed = false,
    isBorder = true,
    customStyle,
    ...props
  },
  ref
) {
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  return (
    <StyledSearchBar
      ref={ref}
      isFixed={isFixed}
      isBorder={isBorder}
      brandColor={brandColor}
      showAppDownloadBanner={showAppDownloadBanner}
      css={customStyle}
    >
      <Wrapper
        variant={variant}
        fullWidth={fullWidth}
        isFixed={isFixed}
        isBottomBorderFixed={isBottomBorderFixed}
        brandColor={brandColor}
        showAppDownloadBanner={showAppDownloadBanner}
        isBorder={isBorder}
      >
        {startIcon}
        <Input brandColor={brandColor} {...props} />
        {endIcon}
      </Wrapper>
    </StyledSearchBar>
  );
});

export default CustomSearchBar;
