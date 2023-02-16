import type { HTMLAttributes } from 'react';

import Image from 'next/image';

import { NEXT_IMAGE_BLUR_URL } from '@constants/common';

interface ImageSrc extends Omit<HTMLAttributes<HTMLImageElement>, 'placeholder'> {
  src: string;
  alt: string;
  index: number;
}

function WebpImg({ src, alt, index, ...props }: ImageSrc) {
  return (
    <picture>
      <source type="image/webp" srcSet={`${src}.webp`} />
      <source type="image/png" srcSet={`${src}.png`} />
      <Image
        src={`${src}.png`}
        alt={alt}
        placeholder="blur"
        blurDataURL={NEXT_IMAGE_BLUR_URL}
        width={100}
        height={100}
        loading={index === 0 ? 'eager' : 'lazy'}
        {...props}
      />
    </picture>
  );
}

export default WebpImg;
