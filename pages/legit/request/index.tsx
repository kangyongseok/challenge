import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';

import type { Swiper } from 'swiper';
import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { QueryClient, dehydrate, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { Box, Flexbox, Grid, Icon, Label, ThemeProvider, dark } from 'mrcamel-ui';
import dayjs from 'dayjs';

import { ImageDetailDialog, LegitUploadInfoPaper } from '@components/UI/organisms';
import { Header, LegitPhotoGuideCard } from '@components/UI/molecules';
import { LegitLabel } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { LegitRequestBottomButton, LegitRequestBrandLogo } from '@components/pages/legitRequest';

import Initializer from '@library/initializer';

import { fetchProductLegit } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';

import { getCookies } from '@utils/cookies';

import { legitRequestState, productLegitParamsState } from '@recoil/legitRequest';
import { toastState } from '@recoil/common';
import useQueryUserInfo from '@hooks/useQueryUserInfo';

function getLegitResultLabel(result?: 0 | 1 | 2 | 3) {
  if (result === 1) {
    return <LegitLabel text="정품의견" />;
  }

  if (result === 2) {
    return <LegitLabel opinion="fake" text="가품의심" />;
  }

  if (result === 3) {
    return <LegitLabel opinion="impossible" text="감정불가" />;
  }

  return undefined;
}

function LegitRequest() {
  const router = useRouter();
  const { id = '' } = router.query;

  const { modelImage, isCompleted } = useRecoilValue(legitRequestState);
  const setToastState = useSetRecoilState(toastState);
  const resetLegitRequestState = useResetRecoilState(legitRequestState);
  const resetProductLegitParamsState = useResetRecoilState(productLegitParamsState);

  const productId = useMemo(() => Number(id), [id]);

  const { data: { roles = [] } = {} } = useQueryUserInfo();

  const [open, setOpen] = useState(false);
  const [labelText, setLabelText] = useState('');
  const [syncIndex, setSyncIndex] = useState(0);

  const {
    data: {
      status,
      result,
      productResult: {
        quoteTitle = '',
        imageModel = '',
        brand: { nameEng = '' } = {},
        photoGuideDetails = []
      } = {},
      description,
      additionalIds = [],
      dateCreated
    } = {}
  } = useQuery(queryKeys.productLegits.legit(productId), () => fetchProductLegit(productId));

  const handleClick = useCallback(() => {
    if (isCompleted)
      setToastState({
        type: 'legit',
        status: 'successRequest'
      });

    resetLegitRequestState();
    resetProductLegitParamsState();

    const hasLegitRole = (roles as string[]).some((role) => role.indexOf('PRODUCT_LEGIT') > -1);

    router.push({ pathname: hasLegitRole ? '/legit/admin' : '/legit', query: { tab: 'my' } });
  }, [
    isCompleted,
    resetLegitRequestState,
    resetProductLegitParamsState,
    roles,
    router,
    setToastState
  ]);

  const handleClickPhotoGuide = (e: MouseEvent<HTMLDivElement>) => {
    const dataIndex = Number(e.currentTarget.getAttribute('data-index') || 0);

    const findPhotoGuideDetail = (photoGuideDetails || []).find((_, index) => index === dataIndex);

    if (!findPhotoGuideDetail) return;

    setOpen(true);
    setSyncIndex(dataIndex);
    setLabelText(findPhotoGuideDetail.commonPhotoGuideDetail.name);
  };

  const handleChange = ({ realIndex }: Swiper) => {
    const findPhotoGuideDetail = (photoGuideDetails || []).find((_, index) => index === realIndex);

    if (!findPhotoGuideDetail) return;

    setLabelText(findPhotoGuideDetail.commonPhotoGuideDetail.name);
  };

  useEffect(() => {
    document.body.className = 'legit-dark';

    return () => {
      document.body.removeAttribute('class');
    };
  }, []);

  if (status === 30) {
    return (
      <ThemeProvider theme="dark">
        <GeneralTemplate
          header={
            <Header
              rightIcon={
                <Box onClick={() => router.back()} customStyle={{ padding: 16 }}>
                  <Icon name="CloseOutlined" />
                </Box>
              }
              isTransparent
              isFixed={false}
              hideTitle
            />
          }
          disablePadding
          customStyle={{
            height: 'auto',
            minHeight: '100%',
            backgroundColor: dark.palette.common.bg03
          }}
        >
          <LegitRequestBrandLogo
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/brands/transparent/${nameEng
              .toLocaleLowerCase()
              .split(' ')
              .join('')}.png`}
          />
          <Box customStyle={{ width: '100%', height: 104 }} />
          <LegitUploadInfoPaper
            model={{
              name: quoteTitle,
              imagSrc:
                (modelImage.length > 0 && modelImage) ||
                imageModel ||
                `https://${process.env.IMAGE_DOMAIN}/assets/images/brands/transparent/${nameEng
                  .toLocaleLowerCase()
                  .split(' ')
                  .join('')}.png`
            }}
            title={quoteTitle}
            subTitle={`신청일 : ${dayjs(dateCreated).format('YYYY.MM.DD HH:mm')}`}
            additionalIds={additionalIds}
            description={description}
            customStyle={{ flex: 1, margin: '0 20px 60px' }}
          >
            <Grid container columnGap={8} rowGap={8}>
              {photoGuideDetails.map(
                ({ id: photoGuideDetailId, commonPhotoGuideDetail, imageUrl }, index) => (
                  <Grid key={`upload-photo-guide-detail-${photoGuideDetailId}`} item xs={3}>
                    <LegitPhotoGuideCard
                      photoGuideDetail={commonPhotoGuideDetail}
                      imageUrl={imageUrl}
                      hideLabel
                      hideStatusHighLite
                      isDark
                      data-index={index}
                      onClick={handleClickPhotoGuide}
                    />
                  </Grid>
                )
              )}
            </Grid>
          </LegitUploadInfoPaper>
          <ImageDetailDialog
            open={open}
            onChange={handleChange}
            onClose={() => setOpen(false)}
            images={(photoGuideDetails || []).map(({ imageUrl }) => imageUrl)}
            label={
              <Flexbox gap={4}>
                {getLegitResultLabel(result)}
                <Label variant="ghost" brandColor="black" text={labelText} />
              </Flexbox>
            }
            syncIndex={syncIndex}
            name={attrProperty.name.LEGIT_INFO}
          />
        </GeneralTemplate>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme="dark">
      <GeneralTemplate
        header={
          <Header showLeft={false} showRight={false} isTransparent isFixed={false} hideTitle />
        }
        disablePadding
        customStyle={{
          height: 'auto',
          minHeight: '100%',
          backgroundColor: dark.palette.common.bg03
        }}
      >
        <LegitRequestBrandLogo
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/brands/transparent/${nameEng
            .toLocaleLowerCase()
            .split(' ')
            .join('')}.png`}
        />
        <Box customStyle={{ width: '100%', height: 104 }} />
        <LegitUploadInfoPaper
          model={{
            name: quoteTitle,
            imagSrc:
              (modelImage.length > 0 && modelImage) ||
              imageModel ||
              `https://${process.env.IMAGE_DOMAIN}/assets/images/brands/transparent/${nameEng
                .toLocaleLowerCase()
                .split(' ')
                .join('')}.png`
          }}
          title="신청이 완료되었습니다"
          additionalIds={additionalIds}
          description={description}
          customStyle={{ flex: 1, margin: '0 20px 52px' }}
        >
          <Grid container columnGap={8} rowGap={8}>
            {photoGuideDetails.map(
              ({ id: photoGuideDetailId, commonPhotoGuideDetail, imageUrl }, index) => (
                <Grid key={`upload-photo-guide-detail-${photoGuideDetailId}`} item xs={3}>
                  <LegitPhotoGuideCard
                    photoGuideDetail={commonPhotoGuideDetail}
                    imageUrl={imageUrl}
                    hideLabel
                    hideStatusHighLite
                    isDark
                    data-index={index}
                    onClick={handleClickPhotoGuide}
                  />
                </Grid>
              )
            )}
          </Grid>
        </LegitUploadInfoPaper>
        <ImageDetailDialog
          open={open}
          onChange={handleChange}
          onClose={() => setOpen(false)}
          images={(photoGuideDetails || []).map(({ imageUrl }) => imageUrl)}
          label={<Label variant="ghost" brandColor="black" text={labelText} />}
          syncIndex={syncIndex}
          name={attrProperty.name.LEGIT_INFO}
        />
        <LegitRequestBottomButton
          onClick={handleClick}
          text="확인"
          backgroundColor={dark.palette.common.bg03}
        />
      </GeneralTemplate>
    </ThemeProvider>
  );
}

export async function getServerSideProps({ req, query: { id } = {} }: GetServerSidePropsContext) {
  const queryClient = new QueryClient();
  const productId = Number(id || 0);

  Initializer.initAccessTokenByCookies(getCookies({ req }));
  Initializer.initAccessUserInQueryClientByCookies(getCookies({ req }), queryClient);

  if (productId > 0) {
    try {
      const response = await queryClient.fetchQuery(queryKeys.productLegits.legit(productId), () =>
        fetchProductLegit(productId)
      );

      if (response) {
        return {
          props: {
            dehydratedState: dehydrate(queryClient)
          }
        };
      }
    } catch {
      //
    }
  }

  return {
    redirect: {
      destination: '/legit?tab=my',
      permanent: false
    }
  };
}

export default LegitRequest;
