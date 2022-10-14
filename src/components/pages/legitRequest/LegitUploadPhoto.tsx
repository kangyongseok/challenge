import { Flexbox, Grid, Typography, dark } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { LegitPhotoGuideCard } from '@components/UI/molecules';

import type { PhotoGuideImage } from '@dto/productLegit';
import type { CommonPhotoGuideDetail } from '@dto/common';

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
  photoGuideDetails,
  photoGuideImages,
  onClick
}: LegitUploadPhotoProps) {
  return (
    <Flexbox direction="vertical" gap={20} customStyle={{ userSelect: 'none' }}>
      <Title variant="h3" weight="medium">
        {`사진을 ${isEdit ? '수정' : '업로드'}해주세요!`}
      </Title>
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
    color: ${dark.palette.secondary.red.light};
  }
`;

export default LegitUploadPhoto;
