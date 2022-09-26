import type { ImgHTMLAttributes } from 'react';
import { useEffect, useRef, useState } from 'react';

import type { CustomStyle } from 'mrcamel-ui';
import { Box } from 'mrcamel-ui';

import { Skeleton } from '@components/UI/atoms';

import {
  BackgroundImage,
  ImageInner,
  ImageWrapper,
  SkeletonWrapper,
  StyledImage
} from './Image.styles';

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  variant?: 'image' | 'backgroundImage';
  ratio?: '1:1' | '1:2' | '2:1' | '4:3' | '16:9';
  disableAspectRatio?: boolean;
  disableLazyLoad?: boolean;
  disableSkeletonRender?: boolean;
  disableSkeletonAnimation?: boolean;
  isRound?: boolean;
  customStyle?: CustomStyle;
}

function Image({
  children,
  variant = 'image',
  src,
  ratio = '1:1',
  disableAspectRatio,
  disableLazyLoad = true,
  disableSkeletonRender = true,
  disableSkeletonAnimation = true,
  isRound = false,
  customStyle,
  ...props
}: ImageProps) {
  const [imageSrc, setImageSrc] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [isIntersecting, setIntersecting] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let observer: IntersectionObserver;

    try {
      observer = new IntersectionObserver(([e]) => setIntersecting(e.isIntersecting));

      if (imageRef.current) {
        observer.observe(imageRef.current);
      }
    } catch {
      setIntersecting(true);
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (disableLazyLoad && src) {
      setImageSrc(src);
    } else if (!disableLazyLoad && isIntersecting && src) {
      setImageSrc(src);
    }
  }, [src, isIntersecting, disableLazyLoad]);

  useEffect(() => {
    if (imageSrc && !disableSkeletonRender) {
      const img = new window.Image();
      img.src = imageSrc;
      img.onload = () => setLoaded(true);
    } else if (disableSkeletonRender) {
      setLoaded(true);
    }
  }, [imageSrc, disableSkeletonRender]);

  if (variant === 'backgroundImage') {
    return (
      <BackgroundImage
        ref={imageRef}
        ratio={ratio}
        dataSrc={disableLazyLoad ? src : imageSrc}
        isRound={isRound}
        {...props}
        css={customStyle}
      >
        {children}
        {!disableSkeletonRender && !loaded && (
          <SkeletonWrapper>
            <Skeleton isRound={isRound} disableAnimation={disableSkeletonAnimation} />
          </SkeletonWrapper>
        )}
      </BackgroundImage>
    );
  }

  if (disableAspectRatio) {
    return (
      <Box customStyle={{ position: 'relative' }}>
        <StyledImage
          ref={imageRef}
          src={disableLazyLoad ? src : imageSrc}
          disableAspectRatio={disableAspectRatio}
          isRound={isRound}
          {...props}
          css={customStyle}
        />
        {!disableSkeletonRender && !loaded && (
          <SkeletonWrapper>
            <Skeleton isRound={isRound} disableAnimation={disableSkeletonAnimation} />
          </SkeletonWrapper>
        )}
      </Box>
    );
  }

  return (
    <ImageWrapper ref={imageRef} ratio={ratio}>
      <ImageInner>
        <StyledImage
          src={disableLazyLoad ? src : imageSrc}
          disableAspectRatio={disableAspectRatio}
          isRound={isRound}
          {...props}
          css={customStyle}
        />
      </ImageInner>
      {!disableSkeletonRender && !loaded && (
        <SkeletonWrapper>
          <Skeleton isRound={isRound} disableAnimation={disableSkeletonAnimation} />
        </SkeletonWrapper>
      )}
    </ImageWrapper>
  );
}

export default Image;
