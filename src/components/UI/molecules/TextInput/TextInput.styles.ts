import styled from '@emotion/styled';
import type { CSSObject } from '@emotion/styled';

import { CAMEL_SUBSET_FONTFAMILY } from '@constants/common';

export type TextInputVariant = 'outline' | 'solid' | 'standard' | 'underline';

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
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui20};
  height: 60px;

  ${({
    theme: {
      box,
      palette: { primary, common }
    },
    variant,
    borderWidth,
    isSelected,
    focused
  }): CSSObject => {
    switch (variant) {
      case 'outline':
        return {
          backgroundColor: isSelected ? primary.highlight : common.uiWhite,
          border: `${borderWidth}px solid ${isSelected || focused ? primary.main : common.ui90}`,
          borderRadius: box.round['8']
        };
      case 'solid':
        return {
          backgroundColor: isSelected ? primary.highlight : common.ui95,
          borderRadius: box.round['8']
        };
      case 'underline':
        return {
          backgroundColor: common.uiWhite
        };
      default:
        return {
          backgroundColor: common.uiWhite
        };
    }
  }};
`;

export const Label = styled.label`
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui80};
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
  color: ${({
    theme: {
      palette: { primary }
    },
    isSelected
  }) => (isSelected ? primary.main : 'currentColor')};
  box-sizing: content-box;
  background: none;
  margin: 0;
  display: block;
  min-width: 0;
  border-bottom: ${({
    theme: {
      palette: { primary, common }
    },
    borderWidth,
    variant,
    isSelected
  }) =>
    variant === 'underline' && `${borderWidth}px solid ${isSelected ? primary.main : common.ui90}`};
  transition-duration: 0.2s;
  font-family: ${CAMEL_SUBSET_FONTFAMILY};

  :focus {
    ${({
      theme: {
        palette: { primary }
      },
      variant,
      borderWidth
    }): CSSObject =>
      variant === 'underline'
        ? {
            outline: 0,
            borderBottom: `${borderWidth}px solid ${primary.main}`
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
