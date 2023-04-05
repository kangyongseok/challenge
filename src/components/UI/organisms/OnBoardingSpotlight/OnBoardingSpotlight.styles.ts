import styled, { CSSObject } from '@emotion/styled';

export const Backdrop = styled.div<{
  backdropOpen: boolean;
}>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  visibility: hidden;
  z-index: ${({ theme: { zIndex } }) => zIndex.dialog};
  background-color: rgba(0, 0, 0, 0.6);
  mix-blend-mode: hard-light;
  transition: opacity 0.2s cubic-bezier(0, 0, 0.2, 1) 0ms;

  ${({ backdropOpen }): CSSObject =>
    backdropOpen
      ? {
          opacity: 1,
          visibility: 'visible'
        }
      : {}};
`;

export const Spotlight = styled.div<{
  offsetTop: number;
  offsetLeft: number;
  targetWidth: number;
  targetHeight: number;
}>`
  position: fixed;
  width: ${({ targetWidth }) => targetWidth}px;
  height: ${({ targetHeight }) => targetHeight}px;
  opacity: 1;
  background-color: #999999;
  z-index: ${({ theme: { zIndex } }) => zIndex.dialog};
  transform: translate(${({ offsetLeft }) => offsetLeft}px, ${({ offsetTop }) => offsetTop}px);
`;
