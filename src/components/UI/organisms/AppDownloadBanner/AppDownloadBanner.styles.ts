import { Button } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';

export const StyledAppDownloadBanner = styled.div<{ scrollTriggered: boolean }>`
  width: 100%;
  height: ${APP_DOWNLOAD_BANNER_HEIGHT}px;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.cmn80};
  padding: 0 12px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: ${({ theme: { zIndex } }) => zIndex.header + 2};
  transition: all 0.5s;
  transform: ${({ scrollTriggered }) => `translateY(${scrollTriggered ? 0 : -100}%)`};
  cursor: pointer;
  ${({ scrollTriggered }): CSSObject =>
    !scrollTriggered
      ? {
          top: '-48px'
        }
      : {}}
`;

export const CamelIconBox = styled.div`
  border-radius: 8px;
  overflow: hidden;
  width: 32px;
  min-width: 32px;
`;

export const DownloadButtonBox = styled(Button)`
  margin-left: auto;
  margin-right: 0;
  border-radius: 16px;
  height: 32px;
  width: 74px;
  white-space: nowrap;
  background: ${({ theme: { palette } }) => palette.common.cmnW};
  color: ${({ theme: { palette } }) => palette.common.cmn80};

  ${({ theme: { typography } }) => ({
    fontSize: typography.body1.size,
    fontWeight: typography.body1.weight.regular,
    lineHeight: typography.body1.lineHeight,
    letterSpacing: typography.body1.letterSpacing
  })};
`;
