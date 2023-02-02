import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Button, Flexbox, Grid, Icon, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { LegitPhotoGuideCard } from '@components/UI/molecules';

import type { PhotoGuideImage } from '@dto/productLegit';
import type { CommonPhotoGuideDetail } from '@dto/common';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { productLegitParamsState } from '@recoil/legitRequest';

interface LegitUploadPhotoProps {
  isLoading: boolean;
  mode?: 'upload' | 'edit' | 'sample';
  showPhotoGuide?: boolean;
  showBanner?: boolean;
  photoGuideDetails: ({ isEdit?: boolean; savedImageUrl?: string } & CommonPhotoGuideDetail)[];
  photoGuideImages: PhotoGuideImage[];
  onClick?: (index: number, isEdit?: boolean) => () => void;
  onClickSample?: () => void;
}

function LegitUploadPhoto({
  isLoading,
  mode = 'upload',
  showPhotoGuide = true,
  showBanner = false,
  photoGuideDetails = [],
  photoGuideImages,
  onClick,
  onClickSample
}: LegitUploadPhotoProps) {
  const router = useRouter();
  const { brandIds = [], categoryIds = [] } = useRecoilValue(productLegitParamsState);

  const handleClick = () => {
    logEvent(attrKeys.legit.CLICK_UPLOAD_GUIDE, {
      name: mode === 'upload' ? attrProperty.name.LEGIT_UPLOAD : attrProperty.name.PRE_CONFIRM_EDIT,
      title: attrProperty.title.INFO_BTN
    });

    router.push({
      pathname: '/legit/guide/sample',
      query: {
        brandId: brandIds[0],
        categoryId: categoryIds[0]
      }
    });
  };

  return (
    <Flexbox
      direction="vertical"
      gap={mode === 'sample' ? 12 : 20}
      customStyle={{ userSelect: 'none', position: 'relative' }}
    >
      {showBanner && (
        <Banner variant="body2" weight="medium">
          👍 가이드에 맞게 앨범에서 선택하거나, 촬영해주세요!
        </Banner>
      )}
      {mode === 'upload' && (
        <Title variant="h3" weight="medium">
          사진을 업로드해주세요!
        </Title>
      )}
      {mode === 'edit' && (
        <Title variant="h3" weight="medium">
          위 의견을 참고해 사진을 보완해주세요!
        </Title>
      )}
      {mode === 'sample' && (
        <Typography variant="h4" weight="bold">
          사진감정 필수사진 예시
        </Typography>
      )}
      {showPhotoGuide && photoGuideDetails.filter(({ imageSample }) => imageSample).length > 0 && (
        <Button
          brandColor="blue"
          startIcon={<Icon name="BangCircleFilled" />}
          fullWidth
          onClick={handleClick}
          customStyle={{
            backgroundColor: 'transparent'
          }}
        >
          사진은 이렇게 올려주세요!
        </Button>
      )}
      <Grid container columnGap={12} rowGap={12}>
        {photoGuideDetails.map((photoGuideDetail, index) => (
          <Grid key={`photo-guide-detail-${photoGuideDetail.id}`} item xs={3}>
            <LegitPhotoGuideCard
              isDark
              hideSample={mode !== 'sample'}
              hideLabel={mode === 'sample'}
              isLoading={isLoading}
              isInvalid={
                photoGuideDetail.isRequired &&
                photoGuideImages.length > 0 &&
                !photoGuideImages.some(
                  (photoGuideImage) => photoGuideImage.photoGuideId === photoGuideDetail.id
                )
              }
              photoGuideDetail={photoGuideDetail}
              imageUrl={
                photoGuideImages.find(
                  (photoGuideImage) => photoGuideImage.photoGuideId === photoGuideDetail.id
                )?.imageUrl || ''
              }
              onClick={onClick ? onClick(index, photoGuideDetail.isEdit) : onClickSample}
            />
          </Grid>
        ))}
      </Grid>
    </Flexbox>
  );
}

const Title = styled(Typography)`
  & ::after {
    content: ' *';
    color: ${({
      theme: {
        palette: { secondary }
      }
    }) => secondary.red.light};
  }
`;

const Banner = styled(Typography)`
  background-color: ${({ theme: { palette } }) => palette.primary.main};
  border-radius: 8px;
  padding: 12px;
  position: absolute;
  top: -72px;
  width: 100%;
`;

export default LegitUploadPhoto;
