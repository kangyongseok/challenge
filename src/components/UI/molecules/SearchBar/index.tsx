import { InputHTMLAttributes, ReactElement, forwardRef } from 'react';

import type { CustomStyle } from '@mrcamelhub/camel-ui';

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
  return (
    <StyledSearchBar ref={ref} isFixed={isFixed} variant={variant} css={customStyle}>
      {startIcon && <StartIcon>{startIcon}</StartIcon>}
      <InputBox
        variant={variant}
        fullWidth={fullWidth}
        hasStartIcon={!!startIcon}
        hasEndIcon={!!endIcon}
      >
        <Wrapper variant={variant} fullWidth={fullWidth}>
          {startAdornment}
          <Input {...props} />
          {endAdornment}
        </Wrapper>
      </InputBox>
      {endIcon && <EndIcon>{endIcon}</EndIcon>}
    </StyledSearchBar>
  );
});

export default SearchBar;
