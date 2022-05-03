import React, { memo, InputHTMLAttributes, ReactElement } from 'react';
import { useTheme, GenericComponentProps } from 'mrcamel-ui';

import { Wrapper, Input } from './SearchBar.styles';

export interface SearchBarProps
  extends GenericComponentProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  variant?: 'outlined' | 'standard';
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  fullWidth?: boolean;
}

function SearchBar({
  componentRef,
  variant,
  startIcon,
  endIcon,
  fullWidth,
  customStyle,
  ...props
}: SearchBarProps) {
  const { theme } = useTheme();
  return (
    <Wrapper
      ref={componentRef}
      theme={theme}
      variant={variant}
      fullWidth={fullWidth}
      css={customStyle}
    >
      {startIcon}
      <Input theme={theme} {...props} />
      {endIcon}
    </Wrapper>
  );
}

export default memo(SearchBar);
