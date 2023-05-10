import { useEffect, useMemo, useState } from 'react';
import type { HTMLAttributes } from 'react';

import { Image, Label, Typography, useTheme } from '@mrcamelhub/camel-ui';

import type { CommonPhotoGuideDetail } from '@dto/common';

import { heicToBlob } from '@utils/common';

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
  const [defaultImageLoadFailed, setDefaultImageLoadFailed] = useState(false);
  const [blobImageUrl, setBlobImageUrl] = useState('');
  const [newImageUrl, setNewImageUrl] = useState(`${staticImageUrl}?w=250&f=webp`);

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
    if (staticImageUrl && imageUrl) {
      newImage.src = `${staticImageUrl}?w=250&f=webp`;
      newImage.onload = () => setIsImageLoading(false);
      newImage.onerror = () => {
        setIsImageLoading(false);
        const defaultImage = document.createElement('img');
        defaultImage.src = imageUrl;
        defaultImage.onerror = () => setDefaultImageLoadFailed(true);
      };
    } else {
      setIsImageLoading(false);
    }
  }, [staticImageUrl, imageUrl]);

  useEffect(() => {
    if (defaultImageLoadFailed && imageUrl) {
      setIsImageLoading(true);
      const fetchImageUrl = imageUrl.replace(
        /https:\/\/static.mrcamel.co.kr\//g,
        'https://mrcamel.s3.ap-northeast-2.amazonaws.com/'
      );
      heicToBlob(fetchImageUrl, fetchImageUrl.split('.')[0]).then((response) => {
        setBlobImageUrl(response || '');
        setIsImageLoading(false);
      });
    }
  }, [defaultImageLoadFailed, imageUrl]);

  useEffect(() => {
    if (blobImageUrl) {
      setNewImageUrl(blobImageUrl);
    }
  }, [blobImageUrl]);

  return (
    <StyledLegitPhotoGuideCard
      imageSample={hideSample ? '' : imageSample}
      imageUrl={newImageUrl}
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
