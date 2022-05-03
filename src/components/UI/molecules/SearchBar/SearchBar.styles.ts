import styled, { CSSObject } from '@emotion/styled';

import { SearchBarProps } from '.';

export const Wrapper = styled.div<Pick<SearchBarProps, 'variant' | 'fullWidth'>>`
  display: flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  background-color: ${({ theme: { palette } }) => palette.common.white};

  ${({ theme: { palette }, variant }): CSSObject => {
    switch (variant) {
      case 'standard':
        return {
          height: 56,
          padding: '0 20px',
          borderBottom: `2px solid ${palette.primary.main}`
        };
      default:
        return {
          height: 48,
          padding: '0 16px',
          border: `2px solid ${palette.primary.main}`,
          borderRadius: 8
        };
    }
  }}

  ${({ theme: { typography } }): CSSObject => ({
    fontSize: typography.body1.size,
    fontWeight: typography.body1.weight.regular,
    lineHeight: typography.body1.lineHeight,
    letterSpacing: typography.body1.letterSpacing
  })}

  ${({ fullWidth }): CSSObject =>
    fullWidth
      ? {
          width: '100%'
        }
      : {}};
`;

export const Input = styled.input`
  width: 100%;
  outline: 0;

  &::placeholder {
    color: ${({ theme: { palette } }) => palette.common.grey['80']};
  }
`;
