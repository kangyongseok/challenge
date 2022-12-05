import styled from '@emotion/styled';

import {
  APP_TOP_STATUS_HEIGHT,
  CAMEL_SUBSET_FONTFAMILY,
  SEARCH_BAR_HEIGHT
} from '@constants/common';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import { SearchBarProps } from '.';

export const StyledSearchBar = styled.div<Pick<SearchBarProps, 'variant' | 'isFixed'>>`
  display: flex;
  align-items: center;
  padding-top: ${isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0}px;

  ${({
    isFixed,
    variant,
    theme: {
      palette: { common },
      zIndex
    }
  }) =>
    isFixed && {
      position: 'fixed',
      left: 0,
      right: 0,
      background: common.uiWhite,
      zIndex: zIndex.header,
      animation: variant !== 'innerOutlined' ? 'smoothFixed .2s forwards' : ''
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
  max-height: ${SEARCH_BAR_HEIGHT + (isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0)}px;
`;

export const Wrapper = styled.div<Pick<SearchBarProps, 'variant' | 'fullWidth'>>`
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'fit-content')};
  height: 44px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  border-radius: 8px;
  border: ${({
    theme: {
      palette: { primary }
    },
    variant
  }) => variant !== 'standard' && `2px solid ${primary.main}`};
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
`;

export const Input = styled.input`
  width: 100%;
  outline: 0;
  background-color: transparent;
  font-family: ${CAMEL_SUBSET_FONTFAMILY};

  ${({ theme: { typography } }) => ({
    fontSize: typography.h4.size,
    fontWeight: typography.h4.weight.medium,
    lineHeight: typography.h4.lineHeight,
    letterSpacing: typography.h4.letterSpacing
  })};

  :disabled {
    background-color: ${({
      theme: {
        palette: { common }
      }
    }) => common.uiWhite};
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
