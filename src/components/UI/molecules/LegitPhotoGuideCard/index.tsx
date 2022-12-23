import { useMemo } from 'react';
import type { HTMLAttributes } from 'react';

import { Label, Typography, useTheme } from 'mrcamel-ui';

import Image from '@components/UI/atoms/Image';

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

  // 0: optional, 1: 필수, 2: 수정, 3: 수정완료
  const status = useMemo(() => {
    if (isEdit && isInvalid) return 1;

    if (isEdit) return imageUrl !== '' && imageUrl !== savedImageUrl ? 3 : 2;

    if (isEdit && !!imageSample) return 3;

    if (isRequired) return 1;

    return 0;
  }, [imageSample, imageUrl, isEdit, isInvalid, isRequired, savedImageUrl]);

  return (
    <StyledLegitPhotoGuideCard
      imageSample={hideSample ? '' : imageSample}
      imageUrl={imageUrl}
      status={status}
      isInvalid={isInvalid}
      hideStatusHighLite={hideStatusHighLite}
      hideHighLite={hideHighLite}
      highLiteColor={highLiteColor}
      isLoading={isLoading}
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
          variant="contained"
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
          variant="contained"
          brandColor={status === 2 ? 'red' : 'primary'}
          size="xsmall"
          text={status === 2 ? '수정' : '수정완료'}
          customStyle={{ position: 'absolute', top: 4, left: 4 }}
        />
      )}
      <PhotoGuideInfo>
        {isLoading ? (
          <AnimationLoading
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/ico/photo_loading_fill.png`}
            alt="loading"
            disableAspectRatio
          />
        ) : (
          <Image
            width="48px"
            height="48px"
            src={isDark ? imageWatermarkDark : imageWatermark}
            alt="WaterMark Img"
            isRound
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
