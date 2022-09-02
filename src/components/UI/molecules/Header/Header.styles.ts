import styled from '@emotion/styled';

import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';

export const StyledHeader = styled.header<{
  isFixed: boolean | undefined;
  showAppDownloadBanner: boolean;
}>`
  width: 100%;
  background-color: ${({ theme: { palette } }) => palette.common.white};
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

export const Wrapper = styled.div<{ customHeight?: number }>`
  width: 100%;
  display: flex;
  align-items: center;
  min-height: ${({ customHeight }) => customHeight || 56}px;
`;

export const Title = styled.div<{ show: boolean; customHeight?: number }>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  min-height: ${({ customHeight }) => customHeight || 56}px;
  visibility: ${({ show }) => !show && 'hidden'};
`;

export const IconBox = styled.div<{ show: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  visibility: ${({ show }) => !show && 'hidden'};
  padding: 16px;
  cursor: pointer;
`;
