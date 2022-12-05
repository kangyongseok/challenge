import styled from '@emotion/styled';

import { APP_TOP_STATUS_HEIGHT, HEADER_HEIGHT } from '@constants/common';

import { isExtendedLayoutIOSVersion } from '@utils/common';

export const StyledHeader = styled.header<{ minHeight: number; isTransparent: boolean }>`
  position: relative;
  min-height: ${({ minHeight }) => minHeight || HEADER_HEIGHT}px;
  background-color: ${({ isTransparent, theme: { palette } }) =>
    isTransparent ? 'transparent' : palette.common.uiWhite};
  transition: all 0.5s;
`;

export const Wrapper = styled.div<{
  isFixed?: boolean | undefined;
}>`
  width: 100%;
  height: ${HEADER_HEIGHT}px;
  background-color: inherit;
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
  position: ${({ isFixed }) => (isFixed ? 'fixed' : 'initial')};
  padding-top: ${isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0}px;
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
