import styled from '@emotion/styled';

export const StyledPageSkeleton = styled.div<{
  isLoading?: boolean;
}>`
  position: fixed;
  overflow: hidden;
  z-index: ${({ theme: { zIndex } }) => zIndex.sheet * 2};
  width: 100%;
  height: 100%;
  transition: opacity 0.2s ease;
  pointer-events: ${({ isLoading }) => (isLoading ? 'none' : 'visible')};
  touch-action: ${({ isLoading }) => (isLoading ? 'none' : 'auto')};
  opacity: ${({ isLoading }) => (isLoading ? 1 : 0)};
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};

  &:after {
    content: '';
    top: 0;
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: ${({ theme: { zIndex } }) => zIndex.sheet * 2 + 1};
  }
`;
