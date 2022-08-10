import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, CtaButton, Flexbox, Toast, Typography, useTheme } from 'mrcamel-ui';

import { ProductListCard, ProductListCardSkeleton } from '@components/UI/molecules';
import { Image } from '@components/UI/atoms';
import LegitLiveGuideAlert from '@components/pages/legit/LegitLiveGuideAlert';

import { logEvent } from '@library/amplitude';

import { fetchUserLegitProducts } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/common';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function LegitMyPanel() {
  const router = useRouter();
  const { openCompleteToast = false } = router.query;
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();
  const [openToast, setOpenToast] = useState(false);

  const { data: accessUser } = useQueryAccessUser();

  const {
    data: { content: legitProducts = [], totalElements = 0 } = {},
    isLoading,
    isFetching
  } = useQuery(queryKeys.users.legitProducts(), fetchUserLegitProducts, {
    enabled: !!accessUser,
    keepPreviousData: true,
    refetchOnMount: true
  });

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    logEvent(attrKeys.legit.CLICK_PRODUCT_DETAIL, {
      name: attrProperty.legitName.LEGIT_MY
    });

    const dataProductId = e.currentTarget.getAttribute('data-product-id');

    router.push(`/products/${dataProductId}/legit`);
  };

  useEffect(() => {
    logEvent(attrKeys.legit.VIEW_LEGIT_MY);
  }, []);

  useEffect(() => {
    if (openCompleteToast === 'true') {
      setOpenToast(true);
    }
  }, [openCompleteToast, router]);

  useEffect(() => {
    if (!openToast && openCompleteToast === 'true') {
      router.replace(
        {
          pathname: router.pathname,
          query: {
            tab: 'my'
          }
        },
        undefined,
        { shallow: true }
      );
    }
  }, [openCompleteToast, openToast, router]);

  if ((!isFetching && !legitProducts.length) || !accessUser) {
    return (
      <Box component="section" customStyle={{ marginTop: 40 }}>
        <Typography variant="h4" weight="bold" customStyle={{ textAlign: 'center' }}>
          아직 신청 내역이 없어요 😥
        </Typography>
        <Box customStyle={{ position: 'relative', maxWidth: 285, margin: '10px auto 0' }}>
          <Image
            variant="backgroundImage"
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/legit/legit-my-guide.png`}
            alt="Legit Guide Img"
            customStyle={{
              position: 'relative',
              paddingTop: '125%'
            }}
          >
            <Box
              customStyle={{
                position: 'absolute',
                left: '50%',
                bottom: -3,
                fontSize: 40,
                transform: 'translateX(-50%) rotate(40deg)'
              }}
            >
              👈
            </Box>
          </Image>
        </Box>
        <Flexbox direction="vertical" customStyle={{ marginTop: 10, textAlign: 'center' }}>
          <Typography customStyle={{ '& > strong': { color: primary.main } }}>
            궁금한 매물의 상세화면에서
            <br />
            <strong>실시간 사진감정</strong>을 바로 신청할 수 있어요!
          </Typography>
          <br />
          <Typography>
            그럼 가장 신청이 많은 <strong>구찌 지갑</strong>
            <br /> 구경 한번 가 볼까요?
          </Typography>
        </Flexbox>
        <Box customStyle={{ marginTop: 20, textAlign: 'center' }}>
          <CtaButton
            variant="contained"
            brandColor="primary"
            onClick={() => {
              logEvent(attrKeys.legit.CLICK_LEGIT_LIST, {
                name: attrProperty.legitName.LEGIT_MY
              });
              router.push({
                pathname: '/products/brands/구찌',
                query: {
                  parentIds: 98,
                  idFilterIds: 100
                }
              });
            }}
          >
            감정가능한 매물 보러가기
          </CtaButton>
        </Box>
        <LegitLiveGuideAlert
          message="실시간 사진감정, 어떻게 진행되는건가요?"
          name={attrProperty.legitName.LEGIT_MY}
          customStyle={{ margin: '52px 0', backgroundColor: common.white }}
        />
      </Box>
    );
  }

  return (
    <>
      <Box component="section" customStyle={{ marginTop: 40 }}>
        <Typography variant="body2" weight="bold">
          전체 {commaNumber(totalElements)}개
        </Typography>
        <Flexbox direction="vertical" gap={20} customStyle={{ margin: '12px 0 20px' }}>
          {isLoading
            ? Array.from({ length: 10 }).map((_, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <ProductListCardSkeleton key={`legit-my-product-${index}`} isRound />
              ))
            : legitProducts.map(({ productId, productResult, status }) => (
                <ProductListCard
                  key={`legit-my-product-${productId}`}
                  product={{
                    ...productResult,
                    isProductLegit: true,
                    productLegit: { ...productResult.productLegit, status }
                  }}
                  data-product-id={productId}
                  onClick={handleClick}
                  hideProductLabel={false}
                  isRound
                />
              ))}
        </Flexbox>
      </Box>
      <Toast open={openToast} onClose={() => setOpenToast(false)}>
        <Typography weight="medium" customStyle={{ color: common.white }}>
          감정신청이 완료되었습니다!
        </Typography>
      </Toast>
    </>
  );
}

export default LegitMyPanel;
