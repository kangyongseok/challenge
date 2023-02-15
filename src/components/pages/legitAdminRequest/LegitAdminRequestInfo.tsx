import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

import type { Swiper } from 'swiper';
import { useRouter } from 'next/router';
import { Flexbox, Grid, Label, Typography, dark, useTheme } from 'mrcamel-ui';
import { uniqBy } from 'lodash-es';
import { useQuery } from '@tanstack/react-query';

import {
  ImageDetailDialog,
  LegitStatusCardHolder,
  LegitUploadInfoPaper
} from '@components/UI/organisms';
import LegitPhotoGuideCard from '@components/UI/molecules/LegitPhotoGuideCard';

import type { CommonPhotoGuideDetail } from '@dto/common';

import { fetchProductLegit } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';

import { getProductDetailUrl } from '@utils/common';

function LegitAdminRequestInfo() {
  const router = useRouter();
  const { id } = router.query;

  const {
    theme: {
      mode,
      palette: { common }
    }
  } = useTheme();

  const [open, setOpen] = useState(false);
  const [labelText, setLabelText] = useState('');
  const [syncIndex, setSyncIndex] = useState(0);
  const [newPhotoGuideDetails, setNewPhotoGuideDetails] = useState<
    {
      commonPhotoGuideDetail: CommonPhotoGuideDetail;
      dateCreated: string;
      dateUpdated: string;
      id: number;
      imageSize: number;
      imageUrl: string;
      isEdit: boolean;
      productId: number;
    }[]
  >([]);

  const { data: productLegit } = useQuery(
    queryKeys.productLegits.legit(Number(id)),
    () => fetchProductLegit(Number(id)),
    {
      enabled: !!id
    }
  );

  const {
    status,
    description,
    additionalIds = [],
    productResult: {
      brand: { nameEng = '' } = {},
      quoteTitle = '',
      imageModel = '',
      imageMain = '',
      imageDetails = '',
      photoGuideDetails = [],
      postType = 0,
      category: { nameEng: categoryNameEng = '' } = {}
    } = {}
  } = productLegit || {};
  const isRequestLegit = postType === 2;
  const brandLogo =
    mode === 'light'
      ? `https://${process.env.IMAGE_DOMAIN}/assets/images/brands/white/${nameEng
          .toLowerCase()
          .replace(/\s/g, '')}.jpg`
      : `https://${process.env.IMAGE_DOMAIN}/assets/images/brands/transparent/${nameEng
          .toLowerCase()
          .replace(/\s/g, '')}.png`;

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const dataIndex = Number(e.currentTarget.getAttribute('data-index') || 0);

    const findPhotoGuideDetail = newPhotoGuideDetails.find((_, index) => index === dataIndex);

    if (!findPhotoGuideDetail) return;

    setOpen(true);
    setSyncIndex(dataIndex);
    setLabelText(findPhotoGuideDetail.commonPhotoGuideDetail.name);
  };

  const handleChange = ({ realIndex }: Swiper) => {
    const findPhotoGuideDetail = newPhotoGuideDetails.find((_, index) => index === realIndex);

    if (!findPhotoGuideDetail) return;

    setLabelText(findPhotoGuideDetail.commonPhotoGuideDetail.name);
  };

  useEffect(() => {
    setNewPhotoGuideDetails(
      uniqBy(
        (photoGuideDetails || []).concat(
          [imageMain, ...(imageDetails || '').split('|')]
            .filter((image) => image)
            .map((image) => ({
              imageUrl: image,
              dateCreated: '',
              dateUpdated: '',
              id: 0,
              imageSize: 0,
              isEdit: false,
              productId: 0,
              commonPhotoGuideDetail: {
                id: 0,
                photoGuideId: 0,
                name: '',
                description: '',
                imageType: 0,
                imageWatermark: '',
                imageWatermarkDark: '',
                imageSample: '',
                sort: 0,
                isRequired: false,
                dateUpdated: '',
                dateCreated: ''
              }
            }))
        ),
        'imageUrl'
      )
    );
  }, [photoGuideDetails, imageMain, imageDetails]);

  if (!productLegit) return null;

  if (isRequestLegit) {
    return (
      <>
        <LegitUploadInfoPaper
          model={{
            name: quoteTitle || '',
            imagSrc: imageModel || brandLogo,
            isEtc: categoryNameEng?.toLowerCase() === 'etc'
          }}
          title="감정을 요청했습니다"
          additionalIds={additionalIds}
          description={description}
          customStyle={{ marginTop: 68 }}
        >
          <Grid container columnGap={12} rowGap={12}>
            {newPhotoGuideDetails.map(({ imageUrl, commonPhotoGuideDetail, isEdit }, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Grid key={`photo-guide-detail-${commonPhotoGuideDetail.id}-${index}`} item xs={3}>
                <LegitPhotoGuideCard
                  photoGuideDetail={commonPhotoGuideDetail}
                  imageUrl={imageUrl}
                  hideLabel
                  hideHighLite={!((status === 12 || status === 13) && isEdit)}
                  highLiteColor={status === 12 && isEdit ? 'red-light' : 'primary-light'}
                  isDark
                  data-index={index}
                  onClick={handleClick}
                />
              </Grid>
            ))}
          </Grid>
        </LegitUploadInfoPaper>
        <ImageDetailDialog
          open={open}
          onChange={handleChange}
          onClose={() => setOpen(false)}
          images={newPhotoGuideDetails.map(({ imageUrl }) => imageUrl)}
          label={
            labelText ? <Label variant="ghost" brandColor="black" text={labelText} /> : undefined
          }
          syncIndex={syncIndex}
        />
      </>
    );
  }

  return (
    <LegitStatusCardHolder
      productLegit={productLegit}
      simplify
      title={
        <Flexbox direction="vertical" gap={4}>
          <Typography variant="h3" weight="medium" customStyle={{ color: common.cmnW }}>
            감정을 요청했습니다.
          </Typography>
          <Typography
            variant="h4"
            weight="bold"
            onClick={() =>
              router.push(
                `${getProductDetailUrl({
                  product: productLegit.productResult,
                  type: 'productResult'
                })}`
              )
            }
            customStyle={{ color: dark.palette.primary.light, cursor: 'pointer' }}
          >
            해당매물 보러가기
          </Typography>
        </Flexbox>
      }
    />
  );
}

export default LegitAdminRequestInfo;
