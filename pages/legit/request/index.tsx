import { useCallback, useEffect, useMemo } from 'react';

import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { QueryClient, dehydrate, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { Box, Grid, ThemeProvider, dark } from 'mrcamel-ui';

import { LegitUploadInfoPaper } from '@components/UI/organisms';
import { Header, LegitPhotoGuideCard } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { LegitRequestBottomButton, LegitRequestBrandLogo } from '@components/pages/legitRequest';

import Initializer from '@library/initializer';
import ChannelTalk from '@library/channelTalk';

import { fetchProductLegit } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';

import { legitRequestState, productLegitParamsState } from '@recoil/legitRequest';
import { toastState } from '@recoil/common';
import useQueryUserInfo from '@hooks/useQueryUserInfo';

function LegitRequest() {
  const router = useRouter();
  const { id = '' } = router.query;

  const { modelImage, isCompleted } = useRecoilValue(legitRequestState);
  const setToastState = useSetRecoilState(toastState);
  const resetLegitRequestState = useResetRecoilState(legitRequestState);
  const resetProductLegitParamsState = useResetRecoilState(productLegitParamsState);

  const productId = useMemo(() => Number(id), [id]);

  const { data: { roles = [] } = {} } = useQueryUserInfo();

  const {
    data: {
      productResult: {
        quoteTitle = '',
        imageModel = '',
        brand: { nameEng = '' } = {},
        photoGuideDetails = []
      } = {},
      description,
      additionalIds = []
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

  useEffect(() => {
    document.body.className = 'legit-dark';

    return () => {
      document.body.removeAttribute('class');
    };
  }, []);

  useEffect(() => {
    ChannelTalk.moveChannelButtonPosition(-30);

    return () => {
      ChannelTalk.resetChannelButtonPosition();
    };
  }, []);

  useEffect(() => {
    ChannelTalk.moveChannelButtonPosition(-30);

    return () => {
      ChannelTalk.resetChannelButtonPosition();
    };
  }, []);

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
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/brands/black/${nameEng
            .toLocaleLowerCase()
            .split(' ')
            .join('')}.jpg`}
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
              ({ id: photoGuideDetailId, commonPhotoGuideDetail, imageUrl }) => (
                <Grid key={`upload-photo-guide-detail-${photoGuideDetailId}`} item xs={3}>
                  <LegitPhotoGuideCard
                    photoGuideDetail={commonPhotoGuideDetail}
                    imageUrl={imageUrl}
                    hideLabel
                    hideStatusHighLite
                    isDark
                  />
                </Grid>
              )
            )}
          </Grid>
        </LegitUploadInfoPaper>
        <LegitRequestBottomButton onClick={handleClick} text="확인" />
      </GeneralTemplate>
    </ThemeProvider>
  );
}

export async function getServerSideProps({ req, query: { id } = {} }: GetServerSidePropsContext) {
  const queryClient = new QueryClient();
  const productId = Number(id || 0);

  Initializer.initAccessTokenByCookies(req.cookies);
  Initializer.initAccessUserInQueryClientByCookies(req.cookies, queryClient);

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
