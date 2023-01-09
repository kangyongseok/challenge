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
  flex: 1 1 auto;
  min-height: ${({ customHeight }) => customHeight || 56}px;
  visibility: ${({ show }) => !show && 'hidden'};
  opacity: ${({ show }) => Number(show)};
  transition: all 0.3s;
`;

export const IconBox = styled.div<{
  show: boolean;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  ${({ show }) =>
    show
      ? {
          padding: 16
        }
      : {
          visibility: 'hidden',
          minWidth: 40
        }};
`;
