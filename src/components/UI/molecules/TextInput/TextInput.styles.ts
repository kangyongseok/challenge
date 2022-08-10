import styled from '@emotion/styled';
import type { CSSObject } from '@emotion/styled';

export type TextInputVariant = 'outlined' | 'contained' | 'standard' | 'underlined';

export type TextInputProps = {
  variant?: TextInputVariant;
  borderWidth: number;
  isSelected: boolean;
  focused: boolean;
};

export const Wrapper = styled.div<TextInputProps>`
  display: inline-flex;
  align-items: center;
  position: relative;
  min-width: 0;
  width: 100%;
  padding: 16px 20px;
  margin: 0;
  border: 0;
  color: ${({ theme }) => theme.palette.common.grey['20']};
  height: 60px;

  ${({ theme, variant, borderWidth, isSelected, focused }): CSSObject => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: isSelected
            ? theme.palette.primary.highlight
            : theme.palette.common.white,
          border: `${borderWidth}px solid ${
            isSelected || focused ? theme.palette.primary.main : theme.palette.common.grey['90']
          }`,
          borderRadius: theme.box.round['8']
        };
      case 'contained':
        return {
          backgroundColor: isSelected
            ? theme.palette.primary.highlight
            : theme.palette.common.grey['95'],
          borderRadius: theme.box.round['8']
        };
      case 'underlined':
        return {
          backgroundColor: theme.palette.common.white
        };
      default:
        return {
          backgroundColor: theme.palette.common.white
        };
    }
  }};
`;

export const Label = styled.label`
  color: ${({ theme }) => theme.palette.common.grey['80']};
  max-width: calc(100% - 40px);
  padding: 0;
  display: block;
  transform-origin: top left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: absolute;
  left: 0;
  top: 0;
  transform: translate(12px, 16px) scale(1);
  transition: color 200ms cubic-bezier(0, 0, 0.2, 1) 0ms,
    transform 200ms cubic-bezier(0, 0, 0.2, 1) 0ms, max-width 200ms cubic-bezier(0, 0, 0.2, 1) 0ms;
  z-index: 1;
  pointer-events: none;

  ${({ theme: { typography } }): CSSObject => ({
    fontSize: typography.h3.size,
    fontWeight: typography.h3.weight.medium,
    lineHeight: typography.h3.lineHeight,
    letterSpacing: typography.h3.letterSpacing
  })}
`;

export const Input = styled.input<Omit<TextInputProps, 'focused'>>`
  color: ${({ theme, isSelected }) => (isSelected ? theme.palette.primary.main : 'currentColor')};
  box-sizing: content-box;
  background: none;
  margin: 0;
  display: block;
  min-width: 0;
  border-bottom: ${({ theme, borderWidth, variant, isSelected }) =>
    variant === 'underlined' &&
    `${borderWidth}px solid ${
      isSelected ? theme.palette.primary.main : theme.palette.common.grey['90']
    }`};
  transition-duration: 0.2s;

  :focus {
    ${({ theme, variant, borderWidth }): CSSObject =>
      variant === 'underlined'
        ? {
            outline: 0,
            borderBottom: `${borderWidth}px solid ${theme.palette.primary.main}`
          }
        : {
            outline: 0
          }}
  }
  :read-only {
    outline: 0;
  }

  ${({ theme: { typography }, isSelected }): CSSObject => ({
    fontSize: typography.h3.size,
    fontWeight: isSelected ? typography.h3.weight.medium : typography.h3.weight.regular,
    lineHeight: typography.h3.lineHeight,
    letterSpacing: typography.h3.letterSpacing
  })}
`;

export const Adornment = styled.div`
  display: flex;

  ${({ theme: { typography } }): CSSObject => ({
    fontSize: typography.h3.size,
    fontWeight: typography.h3.weight.medium,
    lineHeight: typography.h3.lineHeight,
    letterSpacing: typography.h3.letterSpacing
  })}
`;
