import { FocusEvent, InputHTMLAttributes, ReactElement, forwardRef, useState } from 'react';

import type { CSSObject } from '@emotion/styled';

import { Adornment, Input, Label, Wrapper } from './TextInput.styles';
import type { TextInputVariant } from './TextInput.styles';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  onClick?: () => void;
  variant?: TextInputVariant;
  startAdornment?: string | ReactElement;
  endAdornment?: string | ReactElement;
  borderWidth?: number;
  isSelected?: boolean;
  customStyle?: CSSObject;
  inputStyle?: CSSObject;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextField(
  {
    label,
    onClick,
    variant = 'standard',
    startAdornment,
    endAdornment,
    borderWidth = 1,
    isSelected = false,
    customStyle,
    inputStyle,
    onFocus,
    onBlur,
    ...props
  },
  ref
) {
  const [focused, setFocused] = useState(false);

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    if (onFocus) onFocus(e);

    setFocused(true);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    if (onBlur) onBlur(e);

    setTimeout(() => setFocused(false));
  };

  return (
    <Wrapper
      onClick={onClick}
      variant={variant}
      borderWidth={borderWidth}
      isSelected={isSelected}
      focused={focused}
      css={customStyle}
    >
      {label && <Label>{label}</Label>}
      {startAdornment && <Adornment>{startAdornment}</Adornment>}
      <Input
        ref={ref}
        variant={variant}
        borderWidth={borderWidth}
        isSelected={isSelected}
        css={inputStyle}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      {endAdornment && <Adornment>{endAdornment}</Adornment>}
    </Wrapper>
  );
});

export default TextInput;
