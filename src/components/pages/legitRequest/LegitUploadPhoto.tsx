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
  isEdit?: boolean;
  photoGuideDetails: ({ isEdit?: boolean; savedImageUrl?: string } & CommonPhotoGuideDetail)[];
  photoGuideImages: PhotoGuideImage[];
  onClick: (index: number, isEdit?: boolean) => () => void;
}

function LegitUploadPhoto({
  isLoading,
  isEdit = false,
  photoGuideDetails = [],
  photoGuideImages,
  onClick
}: LegitUploadPhotoProps) {
  const router = useRouter();
  const { brandIds = [], categoryIds = [] } = useRecoilValue(productLegitParamsState);

  const handleClick = () => {
    logEvent(attrKeys.legit.CLICK_UPLOAD_GUIDE, {
      name: isEdit ? attrProperty.name.PRE_CONFIRM_EDIT : attrProperty.name.LEGIT_UPLOAD,
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
    <Flexbox direction="vertical" gap={20} customStyle={{ userSelect: 'none' }}>
      <Title variant="h3" weight="medium">
        {`사진을 ${isEdit ? '수정' : '업로드'}해주세요!`}
      </Title>
      {photoGuideDetails.filter(({ imageSample }) => imageSample).length > 0 && (
        <Button
          brandColor="primary"
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
              hideSample
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
              onClick={onClick(index, photoGuideDetail.isEdit)}
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

export default LegitUploadPhoto;
