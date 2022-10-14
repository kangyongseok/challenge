import type { ChangeEvent, FocusEvent, InputHTMLAttributes, MouseEvent, ReactElement } from 'react';
import { forwardRef, useState } from 'react';

import { CustomStyle } from 'mrcamel-ui/dist/types/component';
import { Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

interface SearchHelperInputProps extends InputHTMLAttributes<HTMLInputElement> {
  labelText?: string;
  errorMessage?: ReactElement;
  showCheckIcon?: boolean;
  showClearIcon?: boolean;
  showSuffix?: boolean;
  value: string | undefined;
  onClear?: (e: MouseEvent<HTMLOrSVGElement>) => void;
  onClick?: () => void;
  customStyle?: CustomStyle;
}

const SearchHelperInput = forwardRef<HTMLInputElement, SearchHelperInputProps>(
  function SearchHelperInput(
    {
      labelText,
      errorMessage,
      showCheckIcon = false,
      showClearIcon = false,
      showSuffix = false,
      value,
      onClear,
      onClick,
      readOnly,
      customStyle,
      onChange,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) {
    const {
      theme: {
        palette: { common }
      }
    } = useTheme();
    const [showLabel, setShowLabel] = useState(false);
    const [focused, setFocused] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (onChange) onChange(e);

      if (e.target.value.length > 0 && !!labelText && !showLabel) {
        setShowLabel(true);
      }

      if (e.target.value.length === 0 && !!labelText && showLabel) {
        setShowLabel(false);
      }
    };

    const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
      if (readOnly) return;

      if (onFocus) onFocus(e);

      setFocused(true);
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
      if (readOnly) return;

      if (onBlur) onBlur(e);

      setTimeout(() => setFocused(false), 300);
    };

    return (
      <Flexbox direction="vertical" customStyle={customStyle}>
        {(showLabel || showCheckIcon) && <InputLabel>{labelText}</InputLabel>}
        <Flexbox alignment="center" justifyContent="space-between" onClick={onClick}>
          <Input
            ref={ref}
            name="brand"
            value={value}
            readOnly={readOnly}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          {showSuffix && (
            <Suffix variant="h3" weight="medium" value={value?.length || 1}>
              만원
            </Suffix>
          )}
          {errorMessage}
          {showClearIcon && value && value.length > 0 && focused && (
            <ClearIcon name="CloseOutlined" size="small" color={common.uiWhite} onClick={onClear} />
          )}
          {showCheckIcon && !errorMessage && !focused && (
            <CheckIcon name="CheckOutlined" color={common.uiWhite} />
          )}
        </Flexbox>
      </Flexbox>
    );
  }
);

const InputLabel = styled.label`
  ${({
    theme: {
      palette: { common },
      typography
    }
  }): CSSObject => ({
    color: common.ui60,
    fontSize: typography.body1.size,
    fontWeight: typography.body1.weight.medium,
    lineHeight: typography.body1.lineHeight,
    letterSpacing: typography.body1.letterSpacing
  })}
`;

const Input = styled.input`
  width: calc(100% - 20px);
  outline: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  background-color: transparent;

  ${({
    theme: {
      palette: { common },
      typography
    }
  }): CSSObject => ({
    color: common.ui20,
    fontSize: typography.h3.size,
    fontWeight: typography.h3.weight.medium,
    lineHeight: typography.h3.lineHeight,
    letterSpacing: typography.h3.letterSpacing
  })}

  ::placeholder {
    color: ${({
      theme: {
        palette: { common }
      }
    }) => common.ui80};
  }
`;

const Suffix = styled(Typography)<{ value: number }>`
  position: absolute;
  transform: translateX(100%);
  width: ${({ value }) => value * 11}px;
  white-space: nowrap;
`;

const ClearIcon = styled(Icon)`
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui80};
  border-radius: ${({ theme }) => theme.box.round['16']};
  padding: 2px;

  & > path {
    stroke-width: 4px;
  }
`;

const CheckIcon = styled(Icon)`
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui20};
  border-radius: ${({ theme }) => theme.box.round['16']};
  padding: 5px;
`;

export default SearchHelperInput;
