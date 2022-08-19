import type { ImgHTMLAttributes } from 'react';

import type { CustomStyle } from 'mrcamel-ui';

import { BackgroundImage, ImageInner, ImageWrapper, StyledImage } from './Image.styles';

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  variant?: 'image' | 'backgroundImage';
  ratio?: '1:1' | '1:2' | '2:1' | '4:3' | '16:9';
  disableAspectRatio?: boolean;
  isRound?: boolean;
  customStyle?: CustomStyle;
}

function Image({
  children,
  variant = 'image',
  ratio = '1:1',
  disableAspectRatio,
  isRound = false,
  customStyle,
  ...props
}: ImageProps) {
  if (variant === 'backgroundImage') {
    return (
      <BackgroundImage
        ratio={ratio}
        dataSrc={props.src}
        isRound={isRound}
        {...props}
        css={customStyle}
      >
        {children}
      </BackgroundImage>
    );
  }

  if (disableAspectRatio) {
    return (
      <StyledImage
        disableAspectRatio={disableAspectRatio}
        isRound={isRound}
        {...props}
        css={customStyle}
      />
    );
  }

  return (
    <ImageWrapper ratio={ratio}>
      <ImageInner>
        <StyledImage
          disableAspectRatio={disableAspectRatio}
          isRound={isRound}
          {...props}
          css={customStyle}
        />
      </ImageInner>
    </ImageWrapper>
  );
}

export default Image;
