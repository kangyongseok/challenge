import { useEffect, useState } from 'react';

import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Flexbox, Toast, Typography, useTheme } from 'mrcamel-ui';

import { ProductListCard, ProductListCardSkeleton } from '@components/UI/molecules';

import { Product } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { fetchUserLegitProducts } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { commaNumber, getProductDetailUrl } from '@utils/common';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function LegitMyPanel() {
  const router = useRouter();
  const { openCompleteToast = false } = router.query;
  const {
    theme: {
      palette: { common }
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

  const handleClick =
    ({ product }: { product: Product }) =>
    () => {
      logEvent(attrKeys.legit.CLICK_PRODUCT_DETAIL, {
        name: attrProperty.legitName.LEGIT_MY
      });

      router.push(`${getProductDetailUrl({ product })}/legit`);
    };

  // const handleClickButton = () => {
  //   logEvent(attrKeys.legit.CLICK_LEGIT_LIST, {
  //     name: attrProperty.legitName.LEGIT_MY
  //   });
  //   SessionStorage.set(sessionStorageKeys.productsEventProperties, {
  //     name: attrProperty.legitName.LEGIT,
  //     title: attrProperty.legitTitle.MYLEGIT,
  //     type: attrProperty.legitType.GUIDED
  //   });
  //
  //   router.push({
  //     pathname: '/products/brands/구찌',
  //     query: {
  //       parentIds: 98,
  //       idFilterIds: 100
  //     }
  //   });
  // };

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
      <Box component="section" customStyle={{ marginTop: 100 }}>
        <Box customStyle={{ textAlign: 'center', fontSize: 52 }}>🕵️‍♀️</Box>
        <Typography variant="h4" weight="bold" customStyle={{ textAlign: 'center' }}>
          아직 신청 내역이 없어요 😥
        </Typography>
        <Typography variant="h4" customStyle={{ marginTop: 8, textAlign: 'center' }}>
          9월 중에 다시 감정이 시작될 예정이니
          <br /> 조금만 기다려주세요!
        </Typography>
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
            : legitProducts.map(({ productId, productResult, status, isViewed }) => (
                <ProductListCard
                  key={`legit-my-product-${productId}`}
                  product={{
                    ...productResult,
                    isProductLegit: true,
                    productLegit: { ...productResult.productLegit, status }
                  }}
                  onClick={handleClick({ product: productResult })}
                  hideProductLabel={false}
                  hideNewLegitBadge={false}
                  isRound
                  isLegitViewed={isViewed}
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
