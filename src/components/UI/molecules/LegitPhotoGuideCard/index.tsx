import { useEffect, useMemo, useState } from 'react';
import type { HTMLAttributes } from 'react';

import { Image, Label, Typography, useTheme } from 'mrcamel-ui';

import type { CommonPhotoGuideDetail } from '@dto/common';

import {
  AnimationLoading,
  PhotoGuideInfo,
  StyledLegitPhotoGuideCard
} from './LegitPhotoGuideCard.styles';

export interface LegitPhotoGuideCardProps extends HTMLAttributes<HTMLDivElement> {
  photoGuideDetail: { isEdit?: boolean; savedImageUrl?: string } & CommonPhotoGuideDetail;
  imageUrl?: string;
  hideSample?: boolean;
  hideLabel?: boolean;
  isInvalid?: boolean;
  hideStatusHighLite?: boolean;
  hideHighLite?: boolean;
  highLiteColor?: 'red-light' | 'primary-light';
  isLoading?: boolean;
  isDark?: boolean;
  staticImageUrl?: string;
}

function LegitPhotoGuideCard({
  photoGuideDetail: {
    name,
    imageSample,
    imageWatermark,
    imageWatermarkDark,
    isRequired,
    isEdit = false,
    savedImageUrl
  },
  imageUrl,
  staticImageUrl,
  hideSample = false,
  hideLabel,
  isInvalid,
  hideStatusHighLite,
  hideHighLite = true,
  highLiteColor = 'red-light',
  isLoading = false,
  isDark = false,
  ...props
}: LegitPhotoGuideCardProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  // 0: optional, 1: 필수, 2: 수정, 3: 수정완료
  const status = useMemo(() => {
    if (isEdit && isInvalid) return 1;

    if (isEdit) return imageUrl !== '' && imageUrl !== savedImageUrl ? 3 : 2;

    if (isEdit && !!imageSample) return 3;

    if (isRequired) return 1;

    return 0;
  }, [imageSample, imageUrl, isEdit, isInvalid, isRequired, savedImageUrl]);

  useEffect(() => {
    const newImage = document.createElement('img');
    if (staticImageUrl) {
      newImage.src = `${staticImageUrl}?w=250&f=webp`;
      newImage.onload = () => setIsImageLoading(false);
      newImage.onerror = () => {
        setIsImageLoading(false);
        setLoadFailed(true);
      };
    } else {
      setIsImageLoading(false);
    }
  }, [staticImageUrl]);

  return (
    <StyledLegitPhotoGuideCard
      imageSample={hideSample ? '' : imageSample}
      imageUrl={staticImageUrl && !loadFailed ? `${staticImageUrl}?w=250&f=webp` : imageUrl}
      status={status}
      isInvalid={isInvalid}
      hideStatusHighLite={hideStatusHighLite}
      hideHighLite={hideHighLite}
      highLiteColor={highLiteColor}
      isLoading={isLoading || isImageLoading}
      {...props}
    >
      {!hideLabel && status === 1 && !isInvalid && (
        <Label
          variant="ghost"
          brandColor="black"
          size="xsmall"
          text="필수"
          customStyle={{
            position: 'absolute',
            top: 4,
            left: 4,
            backgroundColor: common.uiWhite
          }}
        />
      )}
      {!hideLabel && status === 1 && isInvalid && (
        <Label
          variant="solid"
          brandColor="red"
          size="xsmall"
          text="필수"
          customStyle={{
            position: 'absolute',
            top: 4,
            left: 4
          }}
        />
      )}
      {!hideLabel && status >= 2 && !isInvalid && (
        <Label
          variant="solid"
          brandColor={status === 2 ? 'red' : 'primary'}
          size="xsmall"
          text={status === 2 ? '수정' : '수정완료'}
          customStyle={{ position: 'absolute', top: 4, left: 4 }}
        />
      )}
      <PhotoGuideInfo>
        {isLoading || isImageLoading ? (
          <AnimationLoading
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/ico/photo_loading_fill.png`}
            alt="loading"
            disableAspectRatio
          />
        ) : (
          <Image
            width={48}
            height={48}
            src={isDark ? imageWatermarkDark : imageWatermark}
            alt="WaterMark Img"
            round={8}
            disableFallback
            disableAspectRatio
          />
        )}
        <Typography variant="body2" customStyle={{ textAlign: 'center', color: common.cmnW }}>
          {name}
        </Typography>
      </PhotoGuideInfo>
    </StyledLegitPhotoGuideCard>
  );
}

export default LegitPhotoGuideCard;
