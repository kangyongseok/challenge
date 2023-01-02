import { useState } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useMutation, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { BottomSheet, Box, Button, Flexbox, Grid, Image, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import ProductGridCardSkeleton from '@components/UI/molecules/Skeletons/ProductGridCardSkeleton';
import { ProductGridCard } from '@components/UI/molecules';
import { LegitLabel } from '@components/UI/atoms';

import type { ProductResult } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { fetchUserLegitTargets } from '@api/user';
import { postRequestProductLegits } from '@api/productLegit';
import { fetchLegit } from '@api/dashboard';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber, getProductDetailUrl } from '@utils/common';

import { deviceIdState, toastState } from '@recoil/common';
import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function HomeLegitAuthenticProductList() {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const deviceId = useRecoilValue(deviceIdState);
  const setToastState = useSetRecoilState(toastState);

  const [open, setOpen] = useState(false);

  const { data: accessUser } = useQueryAccessUser();
  const { data: { recommLegitInfo: { legitTargetCount = 0 } = {} } = {} } = useQueryUserInfo();
  const { data: userLegitTargets = [], isLoading: isLoadingUserLegitTargets } = useQuery(
    queryKeys.users.userLegitTargets(accessUser?.userId),
    fetchUserLegitTargets,
    {
      enabled: !!accessUser
    }
  );
  const { isLoading, data: { caseHistories = [] } = {} } = useQuery(
    queryKeys.dashboards.legit({ result: 1 }),
    () =>
      fetchLegit({
        result: 1
      })
  );

  const { mutate, isLoading: isLoadingMutation, isSuccess } = useMutation(postRequestProductLegits);

  const handleClick = () => {
    if (isLoadingMutation) return;

    mutate(
      { productIds: userLegitTargets.map(({ id }) => id), deviceId },
      {
        onSettled: () => {
          setOpen(false);
        },
        onSuccess: () => setToastState({ type: 'home', status: 'saved' })
      }
    );
  };

  const handleClickBanner = () => {
    logEvent(attrKeys.home.CLICK_LEGIT_MAIN, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.LEGIT_MAIN
    });

    router.push('/legit');
  };

  const handleClickCard = (product: ProductResult) => () => {
    logEvent(attrKeys.home.CLICK_LEGIT_INFO, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.BEST
    });
    router.push(
      `/legit${getProductDetailUrl({
        type: 'productResult',
        product
      }).replace(/\/products/g, '')}/result`
    );
  };

  return (
    <>
      <Box component="section" customStyle={{ marginTop: 32, overflow: 'hidden' }}>
        {isSuccess && (
          <Flexbox
            direction="vertical"
            alignment="center"
            customStyle={{ padding: '52px 32px', backgroundColor: common.cmn80 }}
          >
            <Typography
              variant="h2"
              weight="bold"
              customStyle={{ position: 'relative', textAlign: 'center', color: common.cmnW }}
            >
              사진감정 신청을
              <br />
              완료했어요!
              <Box
                customStyle={{
                  position: 'absolute',
                  top: -33,
                  right: -58,
                  fontSize: 52
                }}
              >
                📸
              </Box>
            </Typography>
            <Typography
              variant="h4"
              customStyle={{ position: 'relative', marginTop: 4, color: common.ui60 }}
            >
              전문가들의 감정결과를 확인해보세요
              <Box
                customStyle={{
                  position: 'absolute',
                  bottom: -25,
                  left: -37,
                  fontSize: 52,
                  transform: 'rotate(-15deg)'
                }}
              >
                👍
              </Box>
            </Typography>
            <Button
              variant="outline"
              size="large"
              onClick={() =>
                router.push({
                  pathname: '/legit',
                  query: {
                    tab: 'my'
                  }
                })
              }
              customStyle={{
                marginTop: 32,
                borderColor: common.ui60,
                color: common.cmnW,
                backgroundColor: 'transparent'
              }}
            >
              신청내역 확인하기
            </Button>
          </Flexbox>
        )}
        {!isLoadingUserLegitTargets &&
          !isSuccess &&
          userLegitTargets &&
          userLegitTargets.length > 0 && (
            <Flexbox
              direction="vertical"
              alignment="center"
              customStyle={{ padding: '52px 32px', backgroundColor: common.cmn80 }}
            >
              <Typography
                variant="h2"
                weight="bold"
                customStyle={{ position: 'relative', textAlign: 'center', color: common.cmnW }}
              >
                사진감정 가능한
                <br />
                매물을 발견했어요!
                <Box
                  customStyle={{
                    position: 'absolute',
                    top: -28,
                    right: -47,
                    fontSize: 52
                  }}
                >
                  📸
                </Box>
              </Typography>
              <Typography variant="h4" customStyle={{ marginTop: 4, color: common.ui60 }}>
                찜한 매물 감정해보세요
              </Typography>
              <Content direction="vertical" gap={32}>
                <Box
                  customStyle={{
                    position: 'absolute',
                    top: -54,
                    left: 7,
                    fontSize: 52,
                    transform: 'rotate(-15deg)'
                  }}
                >
                  👍
                </Box>
                <Flexbox direction="vertical" gap={20}>
                  {userLegitTargets.map((product) => (
                    <Flexbox
                      gap={12}
                      key={`home-recommend-legit-${product.id}`}
                      onClick={() =>
                        router.push(getProductDetailUrl({ type: 'productResult', product }))
                      }
                    >
                      <ImageBox>
                        <Image
                          src={product.imageMain || product.imageThumbnail}
                          alt="Recommend Legit Product Img"
                        />
                      </ImageBox>
                      <Flexbox direction="vertical" gap={4}>
                        <Title variant="body2" weight="medium">
                          {product.title}
                        </Title>
                        <Typography variant="h4" weight="bold">
                          {`${commaNumber(getTenThousandUnitPrice(product.price || 0))}만원`}
                        </Typography>
                      </Flexbox>
                    </Flexbox>
                  ))}
                </Flexbox>
                <Button
                  variant="solid"
                  brandColor="black"
                  size="large"
                  fullWidth
                  onClick={() => setOpen(true)}
                >
                  모두 실시간 사진감정 해보기
                </Button>
              </Content>
            </Flexbox>
          )}
        {!isSuccess && (!userLegitTargets || userLegitTargets.length === 0) && (
          <Image
            disableAspectRatio
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/welcome/legit_banner.png`}
            alt="Legit Banner Img"
            onClick={handleClickBanner}
          />
        )}
        <Typography
          variant="h3"
          weight="bold"
          customStyle={{ margin: !legitTargetCount ? '32px 20px 20px' : '0 20px 20px' }}
        >
          전문가들이 정품의견을 주었어요 🔍
        </Typography>
        <Grid container columnGap={16} rowGap={48} customStyle={{ padding: '0 20px' }}>
          {isLoading &&
            Array.from({ length: 8 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Grid key={`home-authentic-product-skeleton-${index}`} item xs={2}>
                <ProductGridCardSkeleton
                  // eslint-disable-next-line react/no-array-index-key
                  key={`home-authentic-product-skeleton-${index}`}
                  isRound
                />
              </Grid>
            ))}
          {!isLoading &&
            caseHistories.map(({ productResult, legitOpinions }) => (
              <Grid key={`home-authentic-product-${productResult.id}`} item xs={2}>
                <ProductGridCard
                  product={productResult}
                  hidePrice
                  hideAreaWithDateInfo
                  hideProductLabel
                  hidePlatformLogo
                  hideWishButton
                  hideOverlay
                  isRound
                  compact
                  onClick={handleClickCard(productResult)}
                  customLabel={
                    <LegitLabel
                      text={`정품의견 ${commaNumber(
                        legitOpinions.filter(({ result }) => result === 1).length
                      )} 개`}
                      customStyle={{ width: 'fit-content', marginTop: 4 }}
                    />
                  }
                />
              </Grid>
            ))}
        </Grid>
      </Box>
      <BottomSheet disableSwipeable open={open} onClose={() => setOpen(false)}>
        <Flexbox
          direction="vertical"
          alignment="center"
          customStyle={{ padding: '32px 20px 20px' }}
        >
          <Typography variant="h3" weight="bold" customStyle={{ textAlign: 'center' }}>
            {(accessUser || {}).userName || '회원'}님이 관심있어하신{' '}
            {commaNumber(userLegitTargets.length)}건의 매물,
            <br />
            실시간 정가품의견 받아보실래요?
          </Typography>
          <Typography customStyle={{ marginTop: 20 }}>감정비용은 무료입니다!</Typography>
          <Button
            variant="solid"
            brandColor="primary"
            size="large"
            fullWidth
            onClick={handleClick}
            customStyle={{ marginTop: 32 }}
          >
            네, 좋아요!
          </Button>
          <Button
            variant="ghost"
            brandColor="black"
            size="large"
            fullWidth
            onClick={() => setOpen(false)}
            customStyle={{ marginTop: 8 }}
          >
            다음에 할게요
          </Button>
        </Flexbox>
      </BottomSheet>
    </>
  );
}

const Content = styled(Flexbox)`
  position: relative;
  width: 100%;
  margin-top: 32px;
  padding: 20px;
  border-radius: 20px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg01};
`;

const ImageBox = styled.div`
  flex: 1;
  min-width: 72px;
  max-width: 72px;
  border-radius: 8px;
  overflow: hidden;
`;

const Title = styled(Typography)`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export default HomeLegitAuthenticProductList;
