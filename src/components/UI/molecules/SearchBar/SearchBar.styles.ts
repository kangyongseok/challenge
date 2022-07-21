import styled from '@emotion/styled';
import type { CSSObject } from '@emotion/styled';

import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';

import { SearchBarProps } from '.';

export const StyledSearchBar = styled.div<{
  isFixed: boolean;
  showAppDownloadBanner: boolean;
}>`
  ${({ isFixed, showAppDownloadBanner, theme: { palette, zIndex } }) =>
    isFixed && {
      position: 'fixed',
      top: showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT : 0,
      left: 0,
      right: 0,
      width: '100%',
      background: palette.common.white,
      boxShadow: '0px 1px 0px #eeeeee',
      zIndex: zIndex.header,
      animation: 'smoothFixed .2s forwards',
      padding: '16px 20px'
    }}

  @keyframes smoothFixed {
    0% {
      transform: translateY(-20px);
    }
    100% {
      transform: translateY(0px);
    }
  }
`;
export const Wrapper = styled.div<
  Pick<SearchBarProps, 'variant' | 'fullWidth'> & {
    isBottomBorderFixed: boolean;
    showAppDownloadBanner: boolean;
  }
>`
  display: flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  background-color: ${({ theme: { palette } }) => palette.common.white};

  ${({ theme: { palette }, variant }): CSSObject => {
    switch (variant) {
      case 'standard':
        return {
          height: 58,
          minHeight: 58,
          padding: '0 20px',
          borderBottom: `2px solid ${palette.primary.main}`
        };
      default:
        return {
          height: 48,
          minHeight: 48,
          padding: '0 20px',
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

  ${({ isBottomBorderFixed, theme: { zIndex }, showAppDownloadBanner }) =>
    isBottomBorderFixed && {
      top: showAppDownloadBanner ? 60 : 0,
      left: 0,
      borderRadius: 0,
      borderTop: 'none',
      borderRight: 'none',
      borderLeft: 'none',
      height: 58,
      position: 'fixed',
      zIndex: zIndex.header
    }}
`;

export const Input = styled.input`
  width: 100%;
  outline: 0;
  cursor: pointer;

  &::placeholder {
    color: ${({ theme: { palette } }) => palette.common.grey['80']};
  }
  &:disabled {
    background-color: ${({ theme: { palette } }) => palette.common.white};
  }
`;
