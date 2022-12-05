import { Flexbox } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { APP_TOP_STATUS_HEIGHT, HEADER_HEIGHT } from '@constants/common';

import { isExtendedLayoutIOSVersion } from '@utils/common';

export const CustomHeader = styled(Flexbox)`
  position: fixed;
  left: 0;
  padding: ${isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0}px 20px 0;
  width: 100%;
  height: ${HEADER_HEIGHT}px;
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
