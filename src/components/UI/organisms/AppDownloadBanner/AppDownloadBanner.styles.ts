import { Button } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';

export const StyledAppDownloadBanner = styled.div`
  width: 100%;
  height: ${APP_DOWNLOAD_BANNER_HEIGHT}px;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui95};
  padding: 0 20px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: ${({ theme: { zIndex } }) => zIndex.header + 2};
  cursor: pointer;
`;

export const CamelIconBox = styled.div`
  border-radius: 4px;
  overflow: hidden;
  width: 32px;
  min-width: 32px;
`;

export const DownloadButtonBox = styled(Button)`
  margin-left: auto;
  margin-right: 0;
  border-radius: 16px;
  height: 28px;
  white-space: nowrap;
`;
