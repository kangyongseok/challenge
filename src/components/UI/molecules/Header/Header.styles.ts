import styled from '@emotion/styled';

import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';

export const StyledHeader = styled.header<{ minHeight: number; isTransparent: boolean }>`
  position: relative;
  min-height: ${({ minHeight }) => minHeight}px;
  background-color: ${({ isTransparent, theme: { palette } }) =>
    isTransparent ? 'transparent' : palette.common.uiWhite};
  transition: all 0.2s;
`;

export const Wrapper = styled.div<{
  isFixed?: boolean | undefined;
  showAppDownloadBanner?: boolean;
}>`
  width: 100%;
  height: 56px;
  background-color: inherit;
  z-index: ${({ theme: { zIndex } }) => zIndex.header};

  ${({ isFixed, showAppDownloadBanner }) =>
    isFixed
      ? {
          position: 'fixed',
          top: -60 - (showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT : 0),
          padding: `${60 + (showAppDownloadBanner ? 60 + APP_DOWNLOAD_BANNER_HEIGHT : 0)}px 0 0`
        }
      : {
          position: 'initial',
          padding: 0
        }};
`;

export const Title = styled.div<{ show: boolean; customHeight?: number }>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  min-height: ${({ customHeight }) => customHeight || 56}px;
  visibility: ${({ show }) => !show && 'hidden'};
`;

export const IconBox = styled.div<{
  show: boolean;
  disablePadding?: 'top' | 'bottom' | 'left' | 'right';
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  visibility: ${({ show }) => !show && 'hidden'};
  padding: 16px;
  ${({ disablePadding }) => disablePadding && `padding-${disablePadding}: 0`};
  cursor: pointer;
`;
