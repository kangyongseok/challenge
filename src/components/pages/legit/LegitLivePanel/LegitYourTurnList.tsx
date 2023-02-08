import { useCallback, useMemo } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper';
import { useRouter } from 'next/router';
import { Flexbox, Skeleton, Typography, useTheme } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import LegitListCard from '@components/UI/molecules/LegitListCard';

import type { ProductLegitsParams } from '@dto/productLegit';
import type { ProductResult } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { fetchProductLegits } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getProductDetailUrl } from '@utils/common';

function LegitYourTurnList() {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const productLegitsParams: ProductLegitsParams = useMemo(
    () => ({ page: 0, size: 15, status: [20] }),
    []
  );
  const {
    isLoading,
    isFetched,
    data: { productLegits: { content: productLegits = [] } = {} } = {}
  } = useQuery(queryKeys.productLegits.legits(productLegitsParams), () =>
    fetchProductLegits(productLegitsParams)
  );

  const groupedProductLegits = useMemo(
    () =>
      Array.from(
        {
          length:
            Math.floor(productLegits.length / 5) +
            (Math.floor(productLegits.length % 5) > 0 ? 1 : 0)
        },
        (_, index) => productLegits.slice(index * 5, index * 5 + 5)
      ).filter((groupedProductLegit) => groupedProductLegit.length),

    [productLegits]
  );

  const handleClickLegitProduct = useCallback(
    (product: ProductResult) => () => {
      logEvent(attrKeys.legit.CLICK_LEGIT_INFO, {
        name: attrProperty.legitName.LEGIT_MAIN,
        title: attrProperty.legitTitle.YOURTURN
      });

      router.push(
        `/legit${getProductDetailUrl({ type: 'productResult', product }).replace(
          '/products',
          ''
        )}/result`
      );
    },
    [router]
  );

  const handleSwiperYourTurn = () => {
    logEvent(attrKeys.legit.SWIPE_X_LEGIT, {
      name: attrProperty.legitName.LEGIT_MAIN,
      title: attrProperty.legitTitle.YOURTURN
    });
  };

  return isLoading || (isFetched && groupedProductLegits.length > 0) ? (
    <Wrapper>
      {isLoading ? (
        <Flexbox direction="vertical" alignment="center" gap={32}>
          <Flexbox direction="vertical" alignment="center" gap={4}>
            <Skeleton width={184} height={24} round={8} disableAspectRatio />
            <Skeleton width={270} height={32} round={8} disableAspectRatio />
          </Flexbox>
          <Flexbox direction="vertical" gap={12} customStyle={{ width: '100%' }}>
            {Array.from({ length: 5 }, (_, index) => (
              <Flexbox
                key={`productLegit-${index}`}
                alignment="center"
                gap={12}
                customStyle={{ alignItems: 'flex-start' }}
              >
                <Skeleton width={60} height={72} round={8} disableAspectRatio />
                <Flexbox direction="vertical" gap={2} customStyle={{ padding: '5px 0' }}>
                  <Skeleton width={52} height={16} round={8} disableAspectRatio />
                  <Skeleton width={227} height={16} round={8} disableAspectRatio />
                </Flexbox>
              </Flexbox>
            ))}
          </Flexbox>
        </Flexbox>
      ) : (
        <Flexbox direction="vertical" alignment="center" gap={32}>
          <Flexbox direction="vertical" alignment="center" gap={4}>
            <Typography variant="h3" weight="bold">
              정가품 의견 남겨보실래요?
            </Typography>
            <Typography variant="body2" customStyle={{ color: common.ui60, textAlign: 'center' }}>
              보유하고 있거나 잘 아는 브랜드라면 의견을 남겨보세요
              <br />
              (감정사 활동 시 베네핏 지급)
            </Typography>
          </Flexbox>
          <Swiper
            spaceBetween={20}
            pagination={{ clickable: true }}
            modules={[Pagination]}
            style={{ width: '100%', padding: '0 20px', mixBlendMode: 'multiply' }}
            onSlideChange={handleSwiperYourTurn}
          >
            {groupedProductLegits.map((groupedProductLegit, index) => (
              <SwiperSlide
                key={`grouped-product-legits-${groupedProductLegit[index]?.productId || index}`}
              >
                <Flexbox direction="vertical" gap={12}>
                  {groupedProductLegit.map((productLegit) => (
                    <LegitListCard
                      key={`productLegit-${productLegit.productId}`}
                      variant="listB"
                      productLegit={productLegit}
                      hidePrice
                      hideMore
                      onClick={handleClickLegitProduct(productLegit.productResult)}
                      customStyle={{
                        alignItems: 'flex-start',
                        '& > div + div': {
                          padding: '5px 0'
                        }
                      }}
                    />
                  ))}
                </Flexbox>
              </SwiperSlide>
            ))}
          </Swiper>
        </Flexbox>
      )}
    </Wrapper>
  ) : null;
}

const Wrapper = styled.section`
  .swiper-slide {
    margin-right: 20px;
  }
  .swiper-pagination {
    bottom: 0;
  }
  .swiper-pagination-bullet {
    width: 6px;
    height: 6px;
    background-color: ${({ theme: { palette } }) => palette.common.ui90};
    opacity: 1;
    margin: 0 2px !important;
  }
  .swiper-pagination-bullet-active {
    border-radius: 16px;
    background-color: ${({ theme: { palette } }) => palette.common.ui20};
  }
`;

export default LegitYourTurnList;
