import styled from '@emotion/styled';

import { APP_DOWNLOAD_BANNER_HEIGHT, SEARCH_BAR_HEIGHT } from '@constants/common';

import { SearchBarProps } from '.';

export const StyledSearchBar = styled.div<
  Pick<SearchBarProps, 'variant' | 'isFixed'> & {
    showAppDownloadBanner: boolean;
  }
>`
  display: flex;
  align-items: center;

  ${({ isFixed, variant, showAppDownloadBanner, theme: { palette, zIndex } }) =>
    isFixed && {
      position: 'fixed',
      top: showAppDownloadBanner ? -60 - APP_DOWNLOAD_BANNER_HEIGHT : -60,
      left: 0,
      right: 0,
      background: palette.common.white,
      zIndex: zIndex.header,
      animation: variant !== 'innerOutlined' ? 'smoothFixed .2s forwards' : '',
      padding: `${showAppDownloadBanner ? 120 + APP_DOWNLOAD_BANNER_HEIGHT : 60}px 0px 0px`
    }};

  @keyframes smoothFixed {
    0% {
      transform: translateY(-20px);
    }
    100% {
      transform: translateY(0px);
    }
  }
`;

export const InputBox = styled.div<
  Pick<SearchBarProps, 'variant' | 'fullWidth'> & {
    hasStartIcon: boolean;
    hasEndIcon: boolean;
  }
>`
  display: flex;
  align-items: center;
  padding: ${({ variant, hasStartIcon, hasEndIcon }) =>
    variant === 'standard'
      ? `0 ${hasEndIcon ? 0 : 20}px 0 ${hasStartIcon ? 0 : 20}px`
      : `6px ${hasEndIcon ? 0 : 16}px 6px ${hasStartIcon ? 0 : 16}px`};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'fit-content')};
  max-height: ${SEARCH_BAR_HEIGHT}px;
`;

export const Wrapper = styled.div<
  Pick<SearchBarProps, 'variant' | 'fullWidth'> & {
    showAppDownloadBanner: boolean;
  }
>`
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'fit-content')};
  height: 44px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: ${({ theme: { palette } }) => palette.common.white};
  border-radius: 8px;
  border: ${({ theme: { palette }, variant }) =>
    variant !== 'standard' && `2px solid ${palette.primary.main}`};
  z-index: ${({ theme }) => theme.zIndex.header};
`;

export const Input = styled.input`
  width: 100%;
  outline: 0;

  ${({ theme: { typography } }) => ({
    fontSize: typography.h4.size,
    fontWeight: typography.h4.weight.medium,
    lineHeight: typography.h4.lineHeight,
    letterSpacing: typography.h4.letterSpacing
  })};

  :disabled {
    background-color: ${({ theme: { palette } }) => palette.common.white};
  }
`;

const IconBase = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: ${SEARCH_BAR_HEIGHT}px;
  cursor: pointer;
  padding: 16px;
`;

export const StartIcon = styled(IconBase)`
  padding-right: 12px;
`;

export const EndIcon = styled(IconBase)`
  padding-left: 12px;
`;
