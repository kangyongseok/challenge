import React, { forwardRef, InputHTMLAttributes, ReactElement } from 'react';
import { useTheme, CustomStyle } from 'mrcamel-ui';

import { Wrapper, Input } from './SearchBar.styles';

export interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'outlined' | 'standard';
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  fullWidth?: boolean;
  customStyle?: CustomStyle;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar(
  { variant, startIcon, endIcon, fullWidth, customStyle, ...props },
  ref
) {
  const { theme } = useTheme();
  return (
    <Wrapper ref={ref} theme={theme} variant={variant} fullWidth={fullWidth} css={customStyle}>
      {startIcon}
      <Input theme={theme} {...props} />
      {endIcon}
    </Wrapper>
  );
});

export default SearchBar;
