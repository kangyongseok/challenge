import styled from '@emotion/styled';
import type { CSSObject } from '@emotion/styled';

import { APP_DOWNLOAD_BANNER_HEIGHT, CAMEL_SUBSET_FONTFAMILY } from '@constants/common';

import { CustomSearchBarProps } from '.';

export const StyledSearchBar = styled.div<
  Pick<CustomSearchBarProps, 'isFixed' | 'brandColor' | 'isBorder'> & {
    showAppDownloadBanner: boolean;
  }
>`
  ${({
    isFixed,
    showAppDownloadBanner,
    isBorder,
    theme: {
      palette: { common },
      zIndex
    }
  }) =>
    isFixed && {
      position: 'fixed',
      top: showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT : 0,
      left: 0,
      right: 0,
      width: '100%',
      background: common.uiWhite,
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
    top: 48px;
    left: 0;
    right: 0;
    width: 100%;
    height: 40px;
    background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0) 100%);
  }
`;
export const Wrapper = styled.div<
  Pick<
    CustomSearchBarProps,
    'variant' | 'fullWidth' | 'brandColor' | 'isBottomBorderFixed' | 'isFixed'
  > & {
    showAppDownloadBanner: boolean;
    isBorder: boolean;
  }
>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  padding: ${({ isBorder }) => (isBorder ? '12.5px 16px' : 'none')};

  ${({ theme: { palette }, isFixed, variant, brandColor, isBorder }): CSSObject => {
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
          border: isBorder
            ? `2px solid ${brandColor === 'black' && !isFixed ? '#0D0D0D' : palette.primary.main}`
            : 'none',
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
      top: showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT : 0,
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

export const Input = styled.input<Pick<CustomSearchBarProps, 'brandColor'>>`
  width: 100%;
  outline: 0;
  cursor: pointer;
  font-family: ${CAMEL_SUBSET_FONTFAMILY};

  ${({ theme: { typography } }) => ({
    fontSize: typography.body1.size,
    fontWeight: typography.body1.weight.regular,
    lineHeight: typography.body1.lineHeight,
    letterSpacing: typography.body1.letterSpacing
  })};

  &::placeholder {
    ${({
      brandColor,
      theme: {
        palette: { common }
      }
    }) =>
      brandColor === 'primary'
        ? {
            color: common.ui80
          }
        : {
            color: common.ui60
          }};
  }
  &:disabled {
    background-color: ${({
      theme: {
        palette: { common }
      }
    }) => common.uiWhite};
  }
`;
