import type { ImgHTMLAttributes } from 'react';

import type { CustomStyle } from 'mrcamel-ui';

import { BackgroundImage, ImageInner, ImageWrapper, StyledImage } from './Image.styles';

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  variant?: 'image' | 'backgroundImage';
  ratio?: '1:1' | '1:2' | '2:1' | '4:3' | '16:9';
  disableAspectRatio?: boolean;
  customStyle?: CustomStyle;
}

function Image({
  variant = 'image',
  ratio = '1:1',
  disableAspectRatio,
  customStyle,
  ...props
}: ImageProps) {
  if (variant === 'backgroundImage') {
    return <BackgroundImage dataSrc={props.src} />;
  }

  if (disableAspectRatio) {
    return <StyledImage disableAspectRatio={disableAspectRatio} {...props} css={customStyle} />;
  }

  return (
    <ImageWrapper ratio={ratio}>
      <ImageInner>
        <StyledImage disableAspectRatio={disableAspectRatio} {...props} css={customStyle} />
      </ImageInner>
    </ImageWrapper>
  );
}

export default Image;
