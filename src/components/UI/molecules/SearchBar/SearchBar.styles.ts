import styled from '@emotion/styled';
import type { CSSObject } from '@emotion/styled';

import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';

import { SearchBarProps } from '.';

export const StyledSearchBar = styled.div<
  Pick<SearchBarProps, 'isFixed' | 'brandColor' | 'isBorder'> & {
    showAppDownloadBanner: boolean;
  }
>`
  ${({ isFixed, showAppDownloadBanner, isBorder, theme: { palette, zIndex } }) =>
    isFixed && {
      position: 'fixed',
      top: showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT : 0,
      left: 0,
      right: 0,
      width: '100%',
      background: palette.common.white,
      boxShadow: isBorder ? '0px 1px 0px #eeeeee' : undefined,
      zIndex: zIndex.header,
      animation: 'smoothFixed .2s forwards',
      padding: '16px 20px'
    }};

  @keyframes smoothFixed {
    0% {
      transform: translateY(-20px);
    }
    100% {
      transform: translateY(0px);
    }
  }

  :after {
    content: ${({ isFixed, brandColor }) => isFixed && brandColor === 'black' && '""'};
    position: fixed;
    top: 72px;
    left: 0;
    right: 0;
    width: 100%;
    height: 40px;
    background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0) 100%);
  }
`;
export const Wrapper = styled.div<
  Pick<
    SearchBarProps,
    'variant' | 'fullWidth' | 'brandColor' | 'isBottomBorderFixed' | 'isFixed'
  > & {
    showAppDownloadBanner: boolean;
  }
>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  background-color: ${({ theme: { palette } }) => palette.common.white};
  padding: 12.5px 16px;

  ${({ theme: { palette }, isFixed, variant, brandColor }): CSSObject => {
    switch (variant) {
      case 'standard':
        return {
          height: 58,
          minHeight: 58,
          borderBottom: `2px solid ${
            brandColor === 'black' && !isFixed ? '#0D0D0D' : palette.primary.main
          }`
        };
      default:
        return {
          height: 48,
          minHeight: 48,
          border: `2px solid ${
            brandColor === 'black' && !isFixed ? '#0D0D0D' : palette.primary.main
          }`,
          borderRadius: 8
        };
    }
  }};
  ${({ theme: { typography } }): CSSObject => ({
    fontSize: typography.body1.size,
    fontWeight: typography.body1.weight.regular,
    lineHeight: typography.body1.lineHeight,
    letterSpacing: typography.body1.letterSpacing
  })};

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
    }};
`;

export const Input = styled.input<Pick<SearchBarProps, 'brandColor'>>`
  width: 100%;
  outline: 0;
  cursor: pointer;

  ${({ theme: { typography } }) => ({
    fontSize: typography.body1.size,
    fontWeight: typography.body1.weight.regular,
    lineHeight: typography.body1.lineHeight,
    letterSpacing: typography.body1.letterSpacing
  })};

  &::placeholder {
    ${({ brandColor, theme: { palette } }) =>
      brandColor === 'primary'
        ? {
            color: palette.common.grey['80']
          }
        : {
            color: palette.common.grey['60']
          }};
  }
  &:disabled {
    background-color: ${({ theme: { palette } }) => palette.common.white};
  }
`;
