import styled, { CSSObject } from '@emotion/styled';

import { ImageProps } from '.';

export const ImageWrapper = styled.div<Pick<ImageProps, 'ratio'>>`
  position: relative;
  overflow: hidden;

  ${({ ratio }): CSSObject => {
    let cssObject;
    switch (ratio) {
      case '1:2':
        cssObject = {
          paddingTop: '200%'
        };
        break;
      case '2:1':
        cssObject = {
          paddingTop: '50%'
        };
        break;
      case '4:3':
        cssObject = {
          paddingTop: '75%'
        };
        break;
      case '16:9':
        cssObject = {
          paddingTop: '56.25%'
        };
        break;
      default:
        cssObject = {
          paddingTop: '100%'
        };
        break;
    }
    return cssObject;
  }}
`;

export const ImageInner = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transform: translate(50%, 50%);
`;

export const BackgroundImage = styled.div<{
  dataSrc?: string;
}>`
  width: 100%;
  padding-bottom: 100%;
  background-image: url(${({ dataSrc }) => dataSrc});
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
`;

export const StyledImage = styled.img<Pick<ImageProps, 'variant' | 'disableAspectRatio'>>`
  ${({ disableAspectRatio, width, height }): CSSObject =>
    !disableAspectRatio
      ? {
          position: 'absolute',
          top: 0,
          left: 0,
          maxWidth: '100%',
          height: 'auto',
          transform: 'translate(-50%, -50%)'
        }
      : {
          width,
          height
        }}
`;
