import { useState } from 'react';
import type { MouseEvent } from 'react';

import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Grid, Label } from 'mrcamel-ui';

import {
  ImageDetailDialog,
  LegitStatusCardHolder,
  LegitUploadInfoPaper
} from '@components/UI/organisms';
import LegitPhotoGuideCard from '@components/UI/molecules/LegitPhotoGuideCard';

import { fetchProductLegit } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';

function LegitResultRequestInfo() {
  const router = useRouter();
  const { id } = router.query;
  const splitIds = String(id).split('-');
  const productId = Number(splitIds[splitIds.length - 1] || 0);

  const [open, setOpen] = useState(false);
  const [labelText, setLabelText] = useState('');
  const [syncIndex, setSyncIndex] = useState(0);

  const { data: productLegit } = useQuery(
    queryKeys.productLegits.legit(productId),
    () => fetchProductLegit(productId),
    {
      enabled: !!id
    }
  );

  const {
    status,
    productResult: {
      brand: { nameEng = '' } = {},
      postType = 0,
      quoteTitle = '',
      imageModel = '',
      description = '',
      photoGuideDetails = []
    } = {}
  } = productLegit || {};

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const dataIndex = Number(e.currentTarget.getAttribute('data-index') || 0);

    const findPhotoGuideDetail = (photoGuideDetails || []).find((_, index) => index === dataIndex);

    if (!findPhotoGuideDetail) return;

    setOpen(true);
    setSyncIndex(dataIndex);
    setLabelText(findPhotoGuideDetail.commonPhotoGuideDetail.name);
  };

  if (!productLegit) return null;

  if (status === 20 && postType === 2) {
    return (
      <>
        <LegitUploadInfoPaper
          model={{
            name: quoteTitle || '',
            imagSrc:
              imageModel ||
              `https://${process.env.IMAGE_DOMAIN}/assets/images/brands/transparent/${nameEng
                .toLowerCase()
                .replace(/\s/g, '')}.png`
          }}
          title="사진감정중입니다"
          description={description || ''}
          customStyle={{ marginTop: 68 }}
        >
          <Grid container columnGap={12} rowGap={12}>
            {(photoGuideDetails || []).map(({ commonPhotoGuideDetail, imageUrl }, index) => (
              <Grid key={`photo-guide-detail-${commonPhotoGuideDetail.id}`} item xs={3}>
                <LegitPhotoGuideCard
                  photoGuideDetail={commonPhotoGuideDetail}
                  imageUrl={imageUrl}
                  isDark
                  hideLabel
                  hideHighLite
                  hideStatusHighLite
                  data-index={index}
                  onClick={handleClick}
                />
              </Grid>
            ))}
          </Grid>
        </LegitUploadInfoPaper>
        <ImageDetailDialog
          open={open}
          onClose={() => setOpen(false)}
          images={(photoGuideDetails || []).map(({ imageUrl }) => imageUrl)}
          label={<Label variant="ghost" brandColor="black" text={labelText} />}
          syncIndex={syncIndex}
        />
      </>
    );
  }

  return <LegitStatusCardHolder productLegit={productLegit} simplify={status === 20} />;
}

export default LegitResultRequestInfo;
