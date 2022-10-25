import { Flexbox } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';

export const CustomHeader = styled(Flexbox)<{ showAppDownloadBanner: boolean }>`
  position: fixed;
  top: ${({ showAppDownloadBanner }) => (showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT : 0)}px;
  left: 0;
  padding: 0 20px;
  width: 100%;
  height: 56px;
  background: ${({ theme: { palette } }) => palette.common.uiWhite};
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
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
