import styled from '@emotion/styled';

export const StyledHeader = styled.header`
  width: 100%;
  min-height: 56px;
`;

export const VirtualIcon = styled.div<{ isType?: boolean }>`
  width: 20px;
  display: ${({ isType }) => (isType ? 'block' : 'none')};
`;

export const Wrapper = styled.div<{ isFixed: boolean | undefined; showAppDownloadBanner: boolean }>`
  width: 100%;
  height: 56px;
  position: ${({ isFixed }) => (isFixed !== false ? 'fixed' : 'initial')};
  top: ${({ showAppDownloadBanner }) => (showAppDownloadBanner ? 60 : 0)}px;
  left: 0;
  padding: 0 20px;
  background-color: ${({ theme: { palette } }) => palette.common.white};
  z-index: ${({ theme: { zIndex } }) => zIndex.header + 1};
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: center;
`;
